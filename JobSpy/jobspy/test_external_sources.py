import time
import asyncio

from jobspy import external_sources
from jobspy.server import RefreshRequest, get_refresh_jobs, location_match


class FakeFrame:
    empty = False

    def iterrows(self):
        yield 0, {
            "title": "Software Engineer Intern",
            "company": "Example",
            "location": "Mumbai, India",
            "is_remote": False,
            "job_url": "https://example.test/job",
            "site": "naukri",
        }


def test_jobspy_source_uses_india_for_mumbai_and_normalizes_source(monkeypatch):
    call = {}

    def fake_scrape_jobs(**kwargs):
        call.update(kwargs)
        return FakeFrame()

    monkeypatch.setattr("jobspy.scrape_jobs", fake_scrape_jobs)
    monkeypatch.delenv("JOBPULSE_INDEED_COUNTRY", raising=False)

    result = external_sources.fetch_jobspy_source(
        "naukri",
        "software engineer",
        "Mumbai",
        "Internship",
        results_wanted=75,
    )

    assert call["country_indeed"] == "india"
    assert call["site_name"] == ["naukri"]
    assert call["results_wanted"] == 75
    assert result["jobs"][0]["source"] == "Naukri"
    assert result["source"] == "Naukri"
    assert result["jobs"][0]["sourceSearchLocation"] == "Mumbai"


def test_fetch_external_sources_includes_all_jobspy_boards(monkeypatch):
    calls = []

    def fake_jobspy_source(site_name, *args):
        calls.append(site_name)
        return {
            "source": external_sources.JOBSPY_SOURCE_NAMES[site_name],
            "success": True,
            "jobs": [],
            "error": None,
        }

    def empty_provider(source, *_args):
        return {
            "source": source,
            "success": True,
            "jobs": [],
            "error": None,
        }

    monkeypatch.setattr(
        external_sources,
        "fetch_jobspy_source",
        fake_jobspy_source,
    )
    for provider, source in (
        ("fetch_remoteok", "RemoteOK"),
        ("fetch_arbeitnow", "Arbeitnow"),
        ("fetch_jobicy", "Jobicy"),
        ("fetch_remotive", "Remotive"),
        ("fetch_themuse", "The Muse"),
        ("fetch_adzuna", "Adzuna"),
        ("fetch_greenhouse", "Greenhouse"),
        ("fetch_lever", "Lever"),
    ):
        monkeypatch.setattr(
            external_sources,
            provider,
            lambda *args, source=source, **kwargs: empty_provider(source),
        )

    external_sources.fetch_external_sources(
        search_term="software engineer",
        location="Mumbai",
        job_type="Internship",
    )

    assert set(calls) == set(external_sources.JOBSPY_SOURCE_NAMES)


def test_sde_internship_search_uses_multiple_role_queries():
    terms = external_sources.jobspy_search_terms(
        "software engineer",
        "Internship",
    )

    assert len(terms) == 4
    assert "full stack developer internship" in terms
    assert "web developer internship" in terms


def test_jobspy_query_results_merge_across_searches(monkeypatch):
    def fake_jobspy_source(site, search_term, *_args):
        return {
            "success": True,
            "jobs": [
                {
                    "title": "Software Engineer Intern",
                    "jobUrl": f"https://example.test/{search_term}",
                    "source": "LinkedIn",
                }
            ],
            "error": None,
        }

    monkeypatch.setattr(
        external_sources,
        "fetch_jobspy_source",
        fake_jobspy_source,
    )

    result = external_sources.fetch_jobspy_queries(
        "linkedin",
        ["software engineer intern", "backend developer internship"],
        "Mumbai",
        "Internship",
        "",
    )

    assert result["success"] is True
    assert len(result["jobs"]) == 2
    assert result["source"] == "LinkedIn"


def test_jobspy_query_fanout_splits_requested_result_budget(monkeypatch):
    requested = []

    def fake_jobspy_source(site, search_term, _location, _job_type, _work_mode, results_wanted):
        requested.append(results_wanted)
        return {
            "success": True,
            "jobs": [
                {
                    "title": f"{search_term} result {index}",
                    "jobUrl": f"https://example.test/{search_term}/{index}",
                }
                for index in range(results_wanted + 2)
            ],
            "error": None,
        }

    monkeypatch.setattr(
        external_sources,
        "fetch_jobspy_source",
        fake_jobspy_source,
    )

    result = external_sources.fetch_jobspy_queries(
        "linkedin",
        ["query one", "query two", "query three", "query four"],
        "Mumbai",
        "Internship",
        "",
        results_wanted=40,
    )

    assert requested == [10, 10, 10, 10]
    assert len(result["jobs"]) == 40


def test_external_sources_propagate_scrape_budget_to_each_jobspy_board(monkeypatch):
    requested = {}

    def fake_jobspy_source(site_name, *args):
        requested[site_name] = args[-1]
        return {
            "source": external_sources.JOBSPY_SOURCE_NAMES[site_name],
            "success": True,
            "jobs": [],
            "error": None,
        }

    def empty_provider(source, *_args):
        return {
            "source": source,
            "success": True,
            "jobs": [],
            "error": None,
        }

    monkeypatch.setattr(
        external_sources,
        "fetch_jobspy_source",
        fake_jobspy_source,
    )
    for provider, source in (
        ("fetch_remoteok", "RemoteOK"),
        ("fetch_arbeitnow", "Arbeitnow"),
        ("fetch_jobicy", "Jobicy"),
        ("fetch_remotive", "Remotive"),
        ("fetch_themuse", "The Muse"),
        ("fetch_adzuna", "Adzuna"),
        ("fetch_greenhouse", "Greenhouse"),
        ("fetch_lever", "Lever"),
    ):
        monkeypatch.setattr(
            external_sources,
            provider,
            lambda *args, source=source, **kwargs: empty_provider(source),
        )

    external_sources.fetch_external_sources(
        search_term="software engineer",
        location="Mumbai",
        job_type="Full-Time",
        results_wanted=75,
    )

    assert set(requested) == set(external_sources.JOBSPY_SOURCE_NAMES)
    assert set(requested.values()) == {75}


def test_refresh_provider_summary_reports_provider_status(monkeypatch):
    providers = [
        {
            "source": "LinkedIn",
            "success": True,
            "jobs": [{"title": "Matched", "source": "LinkedIn"}],
            "error": None,
        },
        {
            "source": "Indeed",
            "success": True,
            "jobs": [
                {"title": "Eligible", "source": "Indeed"},
                {"title": "Filtered out", "source": "Indeed", "postedDate": "2000-01-01"},
            ],
            "error": None,
        },
        {
            "source": "Naukri",
            "success": False,
            "jobs": [],
            "error": "provider timed out",
        },
    ]

    async def fake_call_external_sources(**_kwargs):
        return {
            "jobs": [
                job
                for provider in providers
                for job in provider["jobs"]
            ],
            "providers": providers,
        }

    monkeypatch.setattr(
        "jobspy.server.call_external_sources",
        fake_call_external_sources,
    )

    jobs, summary = asyncio.run(
        get_refresh_jobs(
            RefreshRequest(results_wanted=20)
        )
    )

    assert len(jobs) == 2
    assert summary["LinkedIn"]["count"] == 1
    assert summary["LinkedIn"]["success"] is True
    assert summary["Indeed"]["count"] == 2
    assert summary["Indeed"]["success"] is True
    assert summary["Naukri"]["success"] is False


def test_location_filter_uses_provider_search_city_for_state_only_result():
    job = {
        "location": "MH, IN",
        "sourceSearchLocation": "Mumbai",
        "workMode": "",
    }

    assert location_match(job, "Mumbai", "") is True
    assert location_match(job, "Mumbai", "On-site") is False


def test_jobspy_query_results_keep_completed_searches_on_timeout(monkeypatch):
    monkeypatch.setattr(external_sources, "JOBSPY_QUERY_TIMEOUT", 0.01)

    def fake_jobspy_source(_site, search_term, *_args):
        if search_term == "slow":
            time.sleep(0.1)
        return {
            "success": True,
            "jobs": [
                {
                    "title": search_term,
                    "jobUrl": f"https://example.test/{search_term}",
                }
            ],
            "error": None,
        }

    monkeypatch.setattr(
        external_sources,
        "fetch_jobspy_source",
        fake_jobspy_source,
    )

    result = external_sources.fetch_jobspy_queries(
        "linkedin",
        ["fast", "slow"],
        "Mumbai",
        "Internship",
        "",
    )

    assert result["success"] is True
    assert [job["title"] for job in result["jobs"]] == ["fast"]
    assert "slow" in str(result["error"])
