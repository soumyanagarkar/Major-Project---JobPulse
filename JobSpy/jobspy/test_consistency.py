from jobspy import matcher
import jobspy.server as server

from jobspy.matcher import (
    _profile_years,
    experience_match,
    experience_within_tolerance,
    extract_experience_requirement,
    search_match,
)
from jobspy.server import RankRequest, infer_job_type, prepare_rank_jobs

assert extract_experience_requirement("2 to 4 years of professional writing experience preferred")["min_years"] == 2.0
assert extract_experience_requirement("2 to 4 years of professional writing experience preferred")["max_years"] == 4.0
assert extract_experience_requirement("10+ years of enterprise full stack engineering experience")["min_years"] == 10.0
assert extract_experience_requirement("The company has over 20 years of experience")["min_years"] is None

# Overlapping employment intervals are counted once.
profile = {
    "experience": [
        {"startDate": "2024-01-01", "endDate": "2025-12-31"},
        {"startDate": "2025-01-01", "endDate": "2026-06-30"},
    ]
}
years = _profile_years(profile)
assert 2.4 < years < 2.6, years


def test_search_term_does_not_override_profile_role():
    profile = {
        "targetRole": "Full Stack Engineer",
        "lookingFor": "Internship",
        "preferredLocation": "Mumbai",
        "preferredWorkMode": "Remote",
        "skills": ["React", "Node", "Express", "MongoDB"],
        "experience": "Fresher",
    }

    job = {
        "title": "Machine Learning Engineer Intern",
        "description": "Build models and ship AI features in a remote internship.",
        "jobType": "Internship",
        "location": "Remote",
        "workMode": "Remote",
        "skills": ["Python", "Machine Learning", "TensorFlow"],
    }

    original_role_match = matcher.profile_role_match
    captured_roles = []

    def fake_profile_role_match(target_role, job_arg, embeddings):
        captured_roles.append(target_role)
        assert target_role == profile["targetRole"]
        return {
            "relevant": True,
            "score": 82.5,
            "titleScore": 82.5,
            "titleOverlap": 60.0,
            "semanticTitle": 0.0,
        }

    matcher.profile_role_match = fake_profile_role_match
    try:
        embeddings = matcher.EmbeddingEngine()
        embeddings.model = None
        result = matcher.match_single_job(job, profile, "ml", embeddings)
        assert captured_roles and captured_roles[0] == profile["targetRole"]
        assert result["roleMatchPercentage"] == 82.5
        assert result["searchRelevant"] is True
    finally:
        matcher.profile_role_match = original_role_match


def test_location_filter_respects_work_mode_and_city():
    remote_job = {"location": "Bangalore", "workMode": "Remote", "jobType": "Internship"}
    onsite_job = {"location": "Mumbai", "workMode": "Onsite", "jobType": "Internship"}
    hybrid_job = {"location": "Mumbai", "workMode": "Hybrid", "jobType": "Internship"}

    assert server.location_match(remote_job, "Mumbai", "Remote") is True
    assert server.location_match(onsite_job, "Mumbai", "Onsite") is True
    assert server.location_match(onsite_job, "Mumbai", "Remote") is False
    assert server.location_match(hybrid_job, "Mumbai", "Hybrid") is True


def test_search_requires_role_evidence_not_description_mentions():
    class NoSemanticSimilarity:
        def similarity(self, _left, _right):
            return 0.0

    jobs = [
        {
            "title": "Compliance Engineer Intern",
            "description": "Finance company provides support services.",
        },
        {
            "title": "Finance/Investment Analyst-Intern",
            "description": "Remote finance internship.",
        },
        {
            "title": "Global Affiliate Business Development",
            "description": "Finance affiliate operations role.",
        },
    ]

    results = [
        search_match("finance", job, NoSemanticSimilarity())["relevant"]
        for job in jobs
    ]

    assert results == [False, True, False]


def test_experience_match_allows_up_to_two_years_difference():
    profile = {"experience": "Fresher", "lookingFor": "Full-Time"}

    assert experience_match(
        "Fresher",
        {"title": "Analyst", "experience": "2 years experience required"},
        profile,
    ) == 100.0
    assert experience_match(
        "5 years",
        {"title": "Analyst", "experience": "3 years experience required"},
        {"experience": "5 years"},
    ) == 100.0


def test_experience_hard_filter_allows_two_years_but_rejects_larger_gaps():
    fresher = {"experience": "Fresher"}

    assert experience_within_tolerance(
        fresher,
        {"experience": "2 years"},
    )
    assert not experience_within_tolerance(
        fresher,
        {"experience": "3 years experience required"},
    )
    assert experience_within_tolerance(
        {"experience": "5 years"},
        {"experience": "3 years experience required"},
    )


def test_profile_preferences_are_hard_filters_for_typed_searches():
    profile = {
        "lookingFor": "Internship",
        "preferredLocation": "Mumbai",
        "preferredWorkMode": "Hybrid",
        "experience": "Fresher",
    }
    jobs = [
        {
            "title": "Analyst Intern",
            "jobType": "Internship",
            "location": "Mumbai",
            "workMode": "Hybrid",
            "experience": "2 years",
        },
        {
            "title": "Analyst Intern",
            "jobType": "Internship",
            "location": "Bangalore",
            "workMode": "Remote",
            "experience": "2 years",
        },
        {
            "title": "Analyst",
            "jobType": "Full-Time",
            "location": "Mumbai",
            "workMode": "Hybrid",
            "experience": "2 years",
        },
        {
            "title": "Analyst Intern",
            "jobType": "Internship",
            "location": "Mumbai",
            "workMode": "Hybrid",
            "experience": "3 years experience required",
        },
    ]
    request = server.RankRequest(
        search_term="analyst",
        profile=profile,
        jobs=jobs,
    )

    eligible = server.prepare_rank_jobs(jobs, request)

    assert [job["experience"] for job in eligible] == ["2 years"]


def test_full_time_filter_requires_explicit_employment_type_evidence():
    jobs = [
        {
            "title": "Senior Data Analyst",
            "description": "Requires three years of relevant experience.",
        },
        {
            "title": "Software Engineer",
            "jobType": "Full-Time",
        },
        {
            "title": "Full-Time Product Analyst",
        },
        {
            "title": "Marketing Specialist",
            "description": "Employment Type: Full-Time",
        },
        {
            "title": "Product Engineer Intern",
            "jobType": "Full-Time",
        },
        {
            "title": "Contract Data Engineer",
            "jobType": "Full-Time",
        },
    ]

    assert infer_job_type(jobs[0]) == ""
    assert infer_job_type(jobs[1]) == "Full-Time"
    assert infer_job_type(jobs[2]) == "Full-Time"
    assert infer_job_type(jobs[3]) == "Full-Time"
    assert infer_job_type(jobs[4]) == "Internship"
    assert infer_job_type(jobs[5]) == "Contract"

    eligible = prepare_rank_jobs(
        jobs,
        RankRequest(job_type="Full-Time"),
    )

    assert [job["title"] for job in eligible] == [
        "Software Engineer",
        "Full-Time Product Analyst",
        "Marketing Specialist",
    ]


print("consistency tests passed")
