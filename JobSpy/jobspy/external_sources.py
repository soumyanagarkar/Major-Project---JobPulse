import json
import logging
import os
from concurrent.futures import (
    ThreadPoolExecutor,
    TimeoutError as FuturesTimeoutError,
    as_completed,
)
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from .normalizer import (
    normalize_remoteok,
    normalize_arbeitnow,
    normalize_jobicy,
)

logger = logging.getLogger("jobpulse-sources")


# ============================================================
# CONFIGURATION
# ============================================================

USER_AGENT = os.getenv(
    "JOBPULSE_USER_AGENT",
    "JobPulse/1.0 (job discovery project)",
)

FETCH_POOL_SIZE = int(
    os.getenv(
        "JOBPULSE_FETCH_POOL",
        "500",
    )
)

REQUEST_TIMEOUT = int(
    os.getenv(
        "JOBPULSE_HTTP_TIMEOUT",
        "10",
    )
)

PROVIDER_TIMEOUT = max(
    5,
    int(os.getenv("JOBPULSE_PROVIDER_TIMEOUT", "120")),
)

JOBSPY_QUERY_TIMEOUT = max(
    5,
    int(os.getenv("JOBPULSE_JOBSPY_QUERY_TIMEOUT", "100")),
)

JOBSPY_RESULTS_WANTED = max(
    1,
    int(os.getenv("JOBPULSE_JOBSPY_RESULTS_WANTED", "500")),
)

MAX_THE_MUSE_PAGES = int(
    os.getenv(
        "JOBPULSE_THE_MUSE_MAX_PAGES",
        "3",
    )
)

MAX_ADZUNA_PAGES = int(
    os.getenv(
        "JOBPULSE_ADZUNA_MAX_PAGES",
        "10",
    )
)

ADZUNA_RESULTS_PER_PAGE = int(
    os.getenv(
        "JOBPULSE_ADZUNA_RESULTS_PER_PAGE",
        "50",
    )
)

JOBICY_COUNT = int(
    os.getenv(
        "JOBPULSE_JOBICY_COUNT",
        "500",
    )
)

JOB_OPPORTUNITIES_LIMIT = int(
    os.getenv(
        "JOBPULSE_JOB_OPPORTUNITIES_LIMIT",
        "500",
    )
)

JOBSPY_SOURCE_NAMES = {
    "linkedin": "LinkedIn",
    "indeed": "Indeed",
    "zip_recruiter": "ZipRecruiter",
    "glassdoor": "Glassdoor",
    "google": "Google",
    "bayt": "Bayt",
    "naukri": "Naukri",
    "bdjobs": "BDJobs",
}

SDE_INTERNSHIP_SEARCH_TERMS = (
    "software engineer intern",
    "software developer internship",
    "full stack developer internship",
    "web developer internship",
)


# ============================================================
# GENERIC HTTP / JSON
# ============================================================

def fetch_json(
    base_url,
    params=None,
    headers=None,
):
    url = base_url

    if params:
        encoded = urlencode(
            params,
            doseq=True,
        )
        url = f"{base_url}?{encoded}"

    request_headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
    }

    if headers:
        request_headers.update(headers)

    request = Request(
        url,
        headers=request_headers,
    )

    with urlopen(
        request,
        timeout=REQUEST_TIMEOUT,
    ) as response:
        body = response.read()

    return json.loads(
        body.decode(
            "utf-8",
            errors="replace",
        )
    )


def safe_string(
    value,
):
    if value is None:
        return ""

    return str(
        value
    ).strip()


def safe_join(
    values,
):
    result = []

    for value in values:
        text = safe_string(
            value
        )

        if text:
            result.append(
                text
            )

    return " ".join(
        result
    )


def safe_int(
    value,
    default=0,
):
    try:
        return int(value)
    except (
        TypeError,
        ValueError,
    ):
        return default


# ============================================================
# SEARCH HELPER
# ============================================================

def text_matches_search(
    text,
    search_term,
):
    """
    Provider-side search filtering is intentionally disabled.

    Retrieval must remain broad.

    Search relevance is handled later by:
        server.py
        matcher.py
    """

    return True


# ============================================================
# REMOTEOK
# ============================================================

def fetch_remoteok(
    search_term="",
):
    try:
        data = fetch_json(
            "https://remoteok.com/api"
        )

        if not isinstance(
            data,
            list,
        ):
            return {
                "source": "RemoteOK",
                "success": False,
                "jobs": [],
                "error":
                    "Invalid RemoteOK response",
            }

        jobs = []

        for item in data:
            if not isinstance(
                item,
                dict,
            ):
                continue

            position = safe_string(
                item.get(
                    "position"
                )
            )

            if not position:
                continue

            normalized = normalize_remoteok(
                item
            )

            if normalized:
                jobs.append(
                    normalized
                )

        return {
            "source":
                "RemoteOK",

            "success":
                True,

            "jobs":
                jobs,

            "error":
                None,
        }

    except Exception as error:
        return {
            "source":
                "RemoteOK",

            "success":
                False,

            "jobs":
                [],

            "error":
                str(error),
        }


# ============================================================
# ARBEITNOW
# ============================================================

def fetch_arbeitnow(
    search_term="",
    location="",
):
    try:
        data = fetch_json(
            "https://www.arbeitnow.com/api/job-board-api"
        )

        raw_jobs = []

        if isinstance(
            data,
            dict,
        ):
            raw_jobs = data.get(
                "data",
                [],
            )

        if not isinstance(
            raw_jobs,
            list,
        ):
            raw_jobs = []

        jobs = []

        for item in raw_jobs:
            if not isinstance(
                item,
                dict,
            ):
                continue

            normalized = normalize_arbeitnow(
                item
            )

            if normalized:
                jobs.append(
                    normalized
                )

        return {
            "source":
                "Arbeitnow",

            "success":
                True,

            "jobs":
                jobs,

            "error":
                None,
        }

    except Exception as error:
        return {
            "source":
                "Arbeitnow",

            "success":
                False,

            "jobs":
                [],

            "error":
                str(error),
        }


# ============================================================
# JOBICY
# ============================================================

def fetch_jobicy(
    search_term="",
):
    try:
        count = max(
            50,
            JOBICY_COUNT,
        )

        data = fetch_json(
            "https://jobicy.com/api/v2/remote-jobs",
            {
                "count":
                    count,
            },
        )

        raw_jobs = []

        if isinstance(
            data,
            dict,
        ):
            raw_jobs = data.get(
                "jobs",
                [],
            )

        if not isinstance(
            raw_jobs,
            list,
        ):
            raw_jobs = []

        jobs = []

        for item in raw_jobs:
            if not isinstance(
                item,
                dict,
            ):
                continue

            normalized = normalize_jobicy(
                item
            )

            if normalized:
                jobs.append(
                    normalized
                )

        return {
            "source":
                "Jobicy",

            "success":
                True,

            "jobs":
                jobs,

            "error":
                None,
        }

    except Exception as error:
        return {
            "source":
                "Jobicy",

            "success":
                False,

            "jobs":
                [],

            "error":
                str(error),
        }


# ============================================================
# THE MUSE
# ============================================================

def fetch_themuse(
    search_term="",
    location="",
):
    try:
        all_jobs = []

        page_size = 20

        max_pages = max(
            1,
            MAX_THE_MUSE_PAGES,
        )

        for page in range(
            max_pages
        ):
            params = {
                "page":
                    page,
            }

            data = fetch_json(
                "https://www.themuse.com/api/public/jobs",
                params,
            )

            if not isinstance(
                data,
                dict,
            ):
                break

            results = data.get(
                "results",
                [],
            )

            if not isinstance(
                results,
                list,
            ):
                break

            if not results:
                break

            all_jobs.extend(
                results
            )

            page_count = data.get(
                "page_count"
            )

            if page_count is not None:
                page_count_int = safe_int(
                    page_count,
                    0,
                )

                if (
                    page_count_int > 0
                    and page + 1
                    >= page_count_int
                ):
                    break

            if len(all_jobs) >= FETCH_POOL_SIZE:
                break

        all_jobs = all_jobs[
            :FETCH_POOL_SIZE
        ]

        jobs = []

        for item in all_jobs:
            if not isinstance(
                item,
                dict,
            ):
                continue

            company = (
                item.get(
                    "company"
                )
                or {}
            )

            if not isinstance(
                company,
                dict,
            ):
                company = {}

            title = safe_string(
                item.get(
                    "name",
                    "",
                )
            )

            company_name = safe_string(
                company.get(
                    "name",
                    "",
                )
            )

            description = safe_string(
                item.get(
                    "contents",
                    "",
                )
            )

            locations = (
                item.get(
                    "locations"
                )
                or []
            )

            location_names = []

            if isinstance(
                locations,
                list,
            ):
                for loc in locations:
                    if not isinstance(
                        loc,
                        dict,
                    ):
                        continue

                    name = safe_string(
                        loc.get(
                            "name",
                            "",
                        )
                    )

                    if name:
                        location_names.append(
                            name
                        )

            refs = (
                item.get(
                    "refs"
                )
                or {}
            )

            if not isinstance(
                refs,
                dict,
            ):
                refs = {}

            landing_page = safe_string(
                refs.get(
                    "landing_page",
                    "",
                )
            )

            if (
                not title
                or not landing_page
            ):
                continue

            location_text = ", ".join(
                location_names
            )

            searchable = safe_join(
                [
                    title,
                    company_name,
                    description,
                    location_text,
                ]
            )

            jobs.append(
                {
                    "title":
                        title,

                    "company":
                        company_name
                        or "Unknown Company",

                    "companyUrl":
                        (
                            safe_string(
                                company.get(
                                    "refs",
                                    {}
                                ).get(
                                    "landing_page",
                                    ""
                                )
                            )
                            if isinstance(
                                company.get(
                                    "refs",
                                    {}
                                ),
                                dict,
                            )
                            else ""
                        ),

                    "location":
                        location_text
                        or "Not specified",

                    "isRemote":
                        "remote"
                        in searchable.lower(),

                    "jobType":
                        safe_string(
                            item.get(
                                "type",
                                "",
                            )
                        ),

                    "description":
                        description,

                    "skills":
                        [],

                    "salary":
                        "Not specified",

                    "minSalary":
                        None,

                    "maxSalary":
                        None,

                    "salaryCurrency":
                        "",

                    "salarySource":
                        "",

                    "source":
                        "The Muse",

                    "jobUrl":
                        landing_page,

                    "jobUrlDirect":
                        landing_page,

                    "applicationUrl":
                        landing_page,

                    "postedDate":
                        item.get(
                            "publication_date"
                        ),
                }
            )

        return {
            "source":
                "The Muse",

            "success":
                True,

            "jobs":
                jobs,

            "error":
                None,
        }

    except Exception as error:
        return {
            "source":
                "The Muse",

            "success":
                False,

            "jobs":
                [],

            "error":
                str(error),
        }


# ============================================================
# ADZUNA
# ============================================================

def fetch_adzuna(
    search_term="",
    location="",
):
    app_id = os.getenv(
        "ADZUNA_APP_ID"
    )

    app_key = os.getenv(
        "ADZUNA_APP_KEY"
    )

    if not app_id or not app_key:
        return {
            "source":
                "Adzuna",

            "success":
                False,

            "jobs":
                [],

            "error":
                (
                    "ADZUNA_APP_ID and "
                    "ADZUNA_APP_KEY are not configured"
                ),
        }

    countries_raw = os.getenv(
        "ADZUNA_COUNTRIES",
        "",
    ).strip()

    countries = [
        country.strip().lower()
        for country in countries_raw.split(",")
        if country.strip()
    ]

    if not countries:
        return {
            "source":
                "Adzuna",

            "success":
                False,

            "jobs":
                [],

            "error":
                "ADZUNA_COUNTRIES is not configured",
        }

    jobs = []

    try:
        pages_per_country = max(
            1,
            MAX_ADZUNA_PAGES,
        )

        for country in countries:
            for page in range(
                1,
                pages_per_country + 1,
            ):
                params = {
                    "app_id":
                        app_id,

                    "app_key":
                        app_key,

                    "results_per_page":
                        ADZUNA_RESULTS_PER_PAGE,
                }

                data = fetch_json(
                    (
                        "https://api.adzuna.com/"
                        f"v1/api/jobs/{country}/search/{page}"
                    ),
                    params,
                )

                if not isinstance(
                    data,
                    dict,
                ):
                    continue

                results = data.get(
                    "results",
                    [],
                )

                if not isinstance(
                    results,
                    list,
                ):
                    continue

                if not results:
                    break

                for item in results:
                    if not isinstance(
                        item,
                        dict,
                    ):
                        continue

                    location_obj = (
                        item.get(
                            "location"
                        )
                        or {}
                    )

                    if not isinstance(
                        location_obj,
                        dict,
                    ):
                        location_obj = {}

                    display_location = safe_string(
                        location_obj.get(
                            "display_name",
                            "",
                        )
                    )

                    company_obj = (
                        item.get(
                            "company"
                        )
                        or {}
                    )

                    if not isinstance(
                        company_obj,
                        dict,
                    ):
                        company_obj = {}

                    company_name = safe_string(
                        company_obj.get(
                            "display_name",
                            "",
                        )
                    )

                    title = safe_string(
                        item.get(
                            "title",
                            "",
                        )
                    )

                    description = safe_string(
                        item.get(
                            "description",
                            "",
                        )
                    )

                    url = safe_string(
                        item.get(
                            "redirect_url",
                            "",
                        )
                    )

                    if (
                        not title
                        or not url
                    ):
                        continue

                    salary_min = item.get(
                        "salary_min"
                    )

                    salary_max = item.get(
                        "salary_max"
                    )

                    salary = "Not specified"

                    if (
                        salary_min is not None
                        or salary_max is not None
                    ):
                        salary = (
                            f"{salary_min or ''} - "
                            f"{salary_max or ''}"
                        ).strip(
                            " -"
                        )

                    searchable = safe_join(
                        [
                            title,
                            company_name,
                            description,
                            display_location,
                        ]
                    )

                    jobs.append(
                        {
                            "title":
                                title,

                            "company":
                                company_name
                                or "Unknown Company",

                            "companyUrl":
                                "",

                            "location":
                                display_location
                                or "Not specified",

                            "isRemote":
                                "remote"
                                in searchable.lower(),

                            "jobType":
                                safe_string(
                                    item.get(
                                        "contract_type",
                                        "",
                                    )
                                ),

                            "description":
                                description,

                            "skills":
                                [],

                            "salary":
                                salary,

                            "minSalary":
                                salary_min,

                            "maxSalary":
                                salary_max,

                            "salaryCurrency":
                                safe_string(
                                    item.get(
                                        "salary_currency",
                                        os.getenv(
                                            "ADZUNA_DEFAULT_CURRENCY",
                                            "",
                                        ),
                                    )
                                ),

                            "salarySource":
                                "Adzuna",

                            "source":
                                "Adzuna",

                            "jobUrl":
                                url,

                            "jobUrlDirect":
                                url,

                            "applicationUrl":
                                url,

                            "postedDate":
                                item.get(
                                    "created"
                                ),
                        }
                    )

                    if len(jobs) >= FETCH_POOL_SIZE:
                        break

                if len(jobs) >= FETCH_POOL_SIZE:
                    break

            if len(jobs) >= FETCH_POOL_SIZE:
                break

        return {
            "source":
                "Adzuna",

            "success":
                True,

            "jobs":
                jobs,

            "error":
                None,
        }

    except Exception as error:
        return {
            "source":
                "Adzuna",

            "success":
                False,

            "jobs":
                [],

            "error":
                str(error),
        }


# ============================================================
# JOB OPPORTUNITIES API
# ============================================================

def fetch_job_opportunities(
    search_term="",
    location="",
):
    try:
        params = {
            "limit":
                max(
                    50,
                    JOB_OPPORTUNITIES_LIMIT,
                )
        }

        data = fetch_json(
            "https://jobopportunitiesapi.org/public/jobs",
            params,
        )

        if isinstance(
            data,
            dict,
        ):
            raw_jobs = (
                data.get("jobs")
                or data.get("results")
                or data.get("data")
                or []
            )

        elif isinstance(
            data,
            list,
        ):
            raw_jobs = data

        else:
            raw_jobs = []

        if not isinstance(
            raw_jobs,
            list,
        ):
            raw_jobs = []

        jobs = []

        for item in raw_jobs:
            if not isinstance(
                item,
                dict,
            ):
                continue

            title = safe_string(
                item.get(
                    "title",
                    item.get(
                        "name",
                        "",
                    ),
                )
            )

            company = safe_string(
                item.get(
                    "company",
                    item.get(
                        "company_name",
                        "",
                    ),
                )
            )

            description = safe_string(
                item.get(
                    "description",
                    item.get(
                        "content",
                        "",
                    ),
                )
            )

            job_location = safe_string(
                item.get(
                    "location",
                    "",
                )
            )

            url = safe_string(
                item.get(
                    "url",
                    item.get(
                        "apply_url",
                        item.get(
                            "job_url",
                            "",
                        ),
                    ),
                )
            )

            if (
                not title
                or not url
            ):
                continue

            searchable = safe_join(
                [
                    title,
                    company,
                    description,
                    job_location,
                ]
            )

            jobs.append(
                {
                    "title":
                        title,

                    "company":
                        company
                        or "Unknown Company",

                    "companyUrl":
                        "",

                    "location":
                        job_location
                        or "Not specified",

                    "isRemote":
                        "remote"
                        in searchable.lower(),

                    "jobType":
                        safe_string(
                            item.get(
                                "job_type",
                                item.get(
                                    "type",
                                    "",
                                ),
                            )
                        ),

                    "description":
                        description,

                    "skills":
                        [],

                    "salary":
                        safe_string(
                            item.get(
                                "salary",
                                "Not specified",
                            )
                        ),

                    "minSalary":
                        None,

                    "maxSalary":
                        None,

                    "salaryCurrency":
                        "",

                    "salarySource":
                        "",

                    "source":
                        "Job Opportunities API",

                    "jobUrl":
                        url,

                    "jobUrlDirect":
                        url,

                    "applicationUrl":
                        url,

                    "postedDate":
                        item.get(
                            "posted_at",
                            item.get(
                                "created_at"
                            ),
                        ),
                }
            )

            if len(jobs) >= FETCH_POOL_SIZE:
                break

        return {
            "source":
                "Job Opportunities API",

            "success":
                True,

            "jobs":
                jobs,

            "error":
                None,
        }

    except Exception as error:
        return {
            "source":
                "Job Opportunities API",

            "success":
                False,

            "jobs":
                [],

            "error":
                str(error),
        }


# ============================================================
# GREENHOUSE
# ============================================================

def get_greenhouse_companies():
    raw = os.getenv(
        "GREENHOUSE_COMPANIES",
        "",
    )

    return [
        slug.strip()
        for slug in raw.split(",")
        if slug.strip()
    ]


def fetch_greenhouse(
    search_term="",
    company_slugs=None,
):
    if company_slugs is None:
        company_slugs = (
            get_greenhouse_companies()
        )

    if not company_slugs:
        return {
            "source":
                "Greenhouse",

            "success":
                False,

            "jobs":
                [],

            "error":
                "No GREENHOUSE_COMPANIES configured",
        }

    jobs = []

    try:
        for slug in company_slugs:
            url = (
                "https://boards-api.greenhouse.io/"
                f"v1/boards/{slug}/jobs"
            )

            data = fetch_json(
                url,
                {
                    "content":
                        "true",
                },
            )

            if not isinstance(
                data,
                dict,
            ):
                continue

            results = data.get(
                "jobs",
                [],
            )

            if not isinstance(
                results,
                list,
            ):
                continue

            for item in results:
                if not isinstance(
                    item,
                    dict,
                ):
                    continue

                title = safe_string(
                    item.get(
                        "title",
                        "",
                    )
                )

                location_obj = (
                    item.get(
                        "location"
                    )
                    or {}
                )

                if not isinstance(
                    location_obj,
                    dict,
                ):
                    location_obj = {}

                job_location = safe_string(
                    location_obj.get(
                        "name",
                        "",
                    )
                )

                absolute_url = safe_string(
                    item.get(
                        "absolute_url",
                        "",
                    )
                )

                content = safe_string(
                    item.get(
                        "content",
                        "",
                    )
                )

                if (
                    not title
                    or not absolute_url
                ):
                    continue

                searchable = safe_join(
                    [
                        title,
                        job_location,
                        content,
                    ]
                )

                jobs.append(
                    {
                        "title":
                            title,

                        "company":
                            slug,

                        "companyUrl":
                            "",

                        "location":
                            job_location
                            or "Not specified",

                        "isRemote":
                            "remote"
                            in searchable.lower(),

                        "jobType":
                            "",

                        "description":
                            content,

                        "skills":
                            [],

                        "salary":
                            "Not specified",

                        "minSalary":
                            None,

                        "maxSalary":
                            None,

                        "salaryCurrency":
                            "",

                        "salarySource":
                            "",

                        "source":
                            "Greenhouse",

                        "jobUrl":
                            absolute_url,

                        "jobUrlDirect":
                            absolute_url,

                        "applicationUrl":
                            absolute_url,

                        "postedDate":
                            item.get(
                                "updated_at"
                            ),
                    }
                )

                if len(jobs) >= FETCH_POOL_SIZE:
                    break

            if len(jobs) >= FETCH_POOL_SIZE:
                break

        return {
            "source":
                "Greenhouse",

            "success":
                True,

            "jobs":
                jobs,

            "error":
                None,
        }

    except Exception as error:
        return {
            "source":
                "Greenhouse",

            "success":
                False,

            "jobs":
                [],

            "error":
                str(error),
        }


# ============================================================
# LEVER
# ============================================================

def get_lever_companies():
    raw = os.getenv(
        "LEVER_COMPANIES",
        "",
    )

    return [
        slug.strip()
        for slug in raw.split(",")
        if slug.strip()
    ]


def fetch_lever(
    search_term="",
    company_slugs=None,
):
    if company_slugs is None:
        company_slugs = (
            get_lever_companies()
        )

    if not company_slugs:
        return {
            "source":
                "Lever",

            "success":
                False,

            "jobs":
                [],

            "error":
                "No LEVER_COMPANIES configured",
        }

    jobs = []

    try:
        for slug in company_slugs:
            url = (
                "https://api.lever.co/v0/postings/"
                f"{slug}"
            )

            data = fetch_json(
                url
            )

            if not isinstance(
                data,
                list,
            ):
                continue

            for item in data:
                if not isinstance(
                    item,
                    dict,
                ):
                    continue

                title = safe_string(
                    item.get(
                        "text",
                        "",
                    )
                )

                categories = (
                    item.get(
                        "categories"
                    )
                    or {}
                )

                if not isinstance(
                    categories,
                    dict,
                ):
                    categories = {}

                job_location = safe_string(
                    categories.get(
                        "location",
                        "",
                    )
                )

                content = (
                    item.get(
                        "descriptionPlain",
                        "",
                    )
                    or item.get(
                        "description",
                        "",
                    )
                )

                content = safe_string(
                    content
                )

                urls = (
                    item.get(
                        "urls"
                    )
                    or {}
                )

                if not isinstance(
                    urls,
                    dict,
                ):
                    urls = {}

                posting_url = safe_string(
                    urls.get(
                        "show",
                        "",
                    )
                )

                if (
                    not title
                    or not posting_url
                ):
                    continue

                workplace_type = safe_string(
                    item.get(
                        "workplaceType",
                        "",
                    )
                )

                jobs.append(
                    {
                        "title":
                            title,

                        "company":
                            slug,

                        "companyUrl":
                            "",

                        "location":
                            job_location
                            or "Not specified",

                        "isRemote":
                            workplace_type.lower()
                            == "remote",

                        "jobType":
                            safe_string(
                                categories.get(
                                    "commitment",
                                    "",
                                )
                            ),

                        "description":
                            content,

                        "skills":
                            [],

                        "salary":
                            safe_string(
                                item.get(
                                    "salaryDescription",
                                    "Not specified",
                                )
                            ),

                        "minSalary":
                            None,

                        "maxSalary":
                            None,

                        "salaryCurrency":
                            "",

                        "salarySource":
                            "",

                        "source":
                            "Lever",

                        "jobUrl":
                            posting_url,

                        "jobUrlDirect":
                            posting_url,

                        "applicationUrl":
                            posting_url,

                        "postedDate":
                            item.get(
                                "createdAt"
                            ),
                    }
                )

                if len(jobs) >= FETCH_POOL_SIZE:
                    break

            if len(jobs) >= FETCH_POOL_SIZE:
                break

        return {
            "source":
                "Lever",

            "success":
                True,

            "jobs":
                jobs,

            "error":
                None,
        }

    except Exception as error:
        return {
            "source":
                "Lever",

            "success":
                False,

            "jobs":
                [],

            "error":
                str(error),
        }


# ============================================================
# REMOTIVE API
# ============================================================

def fetch_remotive(
    search_term="",
):
    try:
        url = "https://remotive.com/api/remote-jobs"
        data = fetch_json(url)

        raw_jobs = []
        if isinstance(data, dict):
            raw_jobs = data.get("jobs", [])
        elif isinstance(data, list):
            raw_jobs = data

        jobs = []
        for item in raw_jobs:
            if not isinstance(item, dict):
                continue

            title = safe_string(item.get("title"))
            company = safe_string(item.get("company_name"))
            url_link = safe_string(item.get("url"))

            if not title or not url_link:
                continue

            raw_type = safe_string(item.get("job_type")).lower()
            job_type = "Full-Time"
            if "intern" in raw_type or "intern" in title.lower():
                job_type = "Internship"
            elif "contract" in raw_type:
                job_type = "Contract"
            elif "part" in raw_type and "time" in raw_type:
                job_type = "Part-Time"

            tags = item.get("tags") or []
            if not isinstance(tags, list):
                tags = [str(tags)]

            jobs.append(
                {
                    "title": title,
                    "company": company or "Unknown Company",
                    "companyUrl": "",
                    "location": safe_string(item.get("candidate_required_location")) or "Remote",
                    "isRemote": True,
                    "jobType": job_type,
                    "description": safe_string(item.get("description")),
                    "skills": [safe_string(t) for t in tags if safe_string(t)],
                    "salary": safe_string(item.get("salary")) or "Not specified",
                    "minSalary": None,
                    "maxSalary": None,
                    "salaryCurrency": "",
                    "salarySource": "",
                    "source": "Remotive",
                    "jobUrl": url_link,
                    "jobUrlDirect": url_link,
                    "applicationUrl": url_link,
                    "postedDate": item.get("publication_date"),
                }
            )

        return {
            "source": "Remotive",
            "success": True,
            "jobs": jobs,
            "error": None,
        }
    except Exception as error:
        return {
            "source": "Remotive",
            "success": False,
            "jobs": [],
            "error": str(error),
        }


# ============================================================
# JOBSPY NATIVE SCRAPERS (LINKEDIN, INDEED)
# ============================================================

def fetch_jobspy_source(
    site_name="linkedin",
    search_term="",
    location="",
    job_type="",
    work_mode="",
    results_wanted=None,
):
    source_name = JOBSPY_SOURCE_NAMES.get(
        safe_string(site_name).lower(),
        safe_string(site_name).capitalize(),
    )
    try:
        from . import scrape_jobs

        # Let the provider search with the current query/profile intent and
        # don't silently constrain an empty location to one country or role.
        st = safe_string(search_term) or "jobs"
        loc = safe_string(location) or None

        raw_job_type = safe_string(job_type).lower()
        if "intern" in raw_job_type:
            scraper_job_type = "internship"
        elif "full" in raw_job_type:
            scraper_job_type = "fulltime"
        elif "part" in raw_job_type:
            scraper_job_type = "parttime"
        elif "contract" in raw_job_type:
            scraper_job_type = "contract"
        elif "temporary" in raw_job_type:
            scraper_job_type = "temporary"
        else:
            scraper_job_type = None

        configured_country = safe_string(
            os.getenv("JOBPULSE_INDEED_COUNTRY")
        )
        indian_locations = (
            "india",
            "mumbai",
            "bombay",
            "delhi",
            "new delhi",
            "bengaluru",
            "bangalore",
            "hyderabad",
            "chennai",
            "pune",
            "kolkata",
            "ahmedabad",
            "gurugram",
            "gurgaon",
            "noida",
            "thane",
        )
        location_text = safe_string(location).lower()
        country_indeed = configured_country or (
            "india"
            if any(city in location_text for city in indian_locations)
            else "usa"
        )

        df = scrape_jobs(
            site_name=[site_name],
            search_term=st,
            location=loc,
            job_type=scraper_job_type,
            is_remote="remote" in safe_string(work_mode).lower(),
            results_wanted=max(
                1,
                safe_int(results_wanted, JOBSPY_RESULTS_WANTED),
            ),
            verbose=1,
            country_indeed=country_indeed,
        )

        jobs = []
        if df is not None and not df.empty:
            for _, row in df.iterrows():
                title = safe_string(row.get("title"))
                url = safe_string(row.get("job_url"))
                if not title:
                    continue

                jobs.append(
                    {
                        "title": title,
                        "company": safe_string(row.get("company")) or "Unknown Company",
                        "companyUrl": "",
                        "location": safe_string(row.get("location")) or "Remote",
                        "isRemote": bool(row.get("is_remote")),
                        "jobType": safe_string(row.get("job_type")) or {
                            "internship": "Internship",
                            "fulltime": "Full-Time",
                            "parttime": "Part-Time",
                            "contract": "Contract",
                            "temporary": "Temporary",
                        }.get(scraper_job_type, ""),
                        "description": safe_string(row.get("description")),
                        "skills": [],
                        "salary": "Not specified",
                        "minSalary": row.get("min_amount"),
                        "maxSalary": row.get("max_amount"),
                        "salaryCurrency": safe_string(row.get("currency")),
                        "salarySource": safe_string(row.get("site")),
                        "source": source_name,
                        "jobUrl": url,
                        "jobUrlDirect": url,
                        "applicationUrl": url,
                        "postedDate": str(row.get("date_posted")) if row.get("date_posted") is not None else None,
                        "sourceSearchLocation": loc or "",
                    }
                )

        return {
            "source": source_name,
            "success": True,
            "jobs": jobs,
            "error": None,
        }
    except Exception as error:
        return {
            "source": source_name,
            "success": False,
            "jobs": [],
            "error": str(error),
        }


# ============================================================
# PROVIDER RESULT NORMALIZATION
# ============================================================

def normalize_provider_result(
    source,
    result,
):
    if not isinstance(
        result,
        dict,
    ):
        return {
            "source":
                source,

            "success":
                False,

            "jobs":
                [],

            "error":
                "Provider returned invalid result",
        }

    jobs = result.get(
        "jobs",
        [],
    )

    if not isinstance(
        jobs,
        list,
    ):
        jobs = []

    return {
        "source":
            result.get(
                "source",
                source,
            )
            or source,

        "success":
            bool(
                result.get(
                    "success",
                    False,
                )
            ),

        "jobs":
            jobs,

        "error":
            result.get(
                "error"
            ),
    }


# ============================================================
# RUN ALL SOURCES CONCURRENTLY
# ============================================================

def jobspy_search_terms(search_term, job_type):
    term = safe_string(search_term)
    if not term:
        return ["jobs"]

    normalized_term = " ".join(term.lower().split())
    normalized_job_type = safe_string(job_type).lower()

    if "intern" in normalized_job_type and normalized_term in {
        "sde",
        "software engineer",
        "software development engineer",
    }:
        return list(SDE_INTERNSHIP_SEARCH_TERMS)

    terms = [term]
    if "intern" in normalized_job_type:
        lowered = normalized_term
        for suffix in (" internship", " intern"):
            if not lowered.endswith(suffix):
                terms.append(f"{term}{suffix}")

    if normalized_term == "software engineer" and "intern" in normalized_job_type:
        additional = [
            "software developer internship",
            "full stack developer internship",
            "web developer internship",
        ]
        terms.extend(additional)

    return list(dict.fromkeys(terms))


def deduplicate_provider_jobs(jobs):
    seen = set()
    unique = []
    for job in jobs:
        identity = safe_string(
            job.get("jobUrl")
            or job.get("jobUrlDirect")
            or job.get("applicationUrl")
        )
        if not identity:
            identity = "|".join(
                (
                    safe_string(job.get("title")),
                    safe_string(job.get("company")),
                    safe_string(job.get("location")),
                )
            )
        key = identity.lower()
        if key in seen:
            continue
        seen.add(key)
        unique.append(job)
    return unique


def fetch_jobspy_queries(
    site_name,
    search_terms,
    location,
    job_type,
    work_mode,
    results_wanted=JOBSPY_RESULTS_WANTED,
):
    source_name = JOBSPY_SOURCE_NAMES.get(
        safe_string(site_name).lower(),
        safe_string(site_name).capitalize(),
    )
    query_result_limit = max(
        1,
        safe_int(results_wanted, JOBSPY_RESULTS_WANTED),
    )
    per_query_limit = max(
        1,
        (query_result_limit + len(search_terms) - 1) // len(search_terms),
    ) if search_terms else query_result_limit
    results = []
    max_workers = max(1, min(2, len(search_terms)))
    executor = ThreadPoolExecutor(max_workers=max_workers)
    futures = {
        executor.submit(
            fetch_jobspy_source,
            site_name,
            search_term,
            location,
            job_type,
            work_mode,
            per_query_limit,
        ): search_term
        for search_term in search_terms
    }
    try:
        for future in as_completed(
            futures,
            timeout=JOBSPY_QUERY_TIMEOUT,
        ):
            search_term = futures[future]
            try:
                results.append((search_term, future.result()))
            except Exception as error:
                results.append(
                    (
                        search_term,
                        {
                            "success": False,
                            "jobs": [],
                            "error": str(error),
                        },
                    )
                )
    except FuturesTimeoutError:
        completed_terms = {term for term, _ in results}
        for future, search_term in futures.items():
            if search_term in completed_terms:
                continue
            if future.done():
                try:
                    results.append((search_term, future.result()))
                except Exception as error:
                    results.append(
                        (
                            search_term,
                            {
                                "success": False,
                                "jobs": [],
                                "error": str(error),
                            },
                        )
                    )
                continue
            future.cancel()
            results.append(
                (
                    search_term,
                    {
                        "success": False,
                        "jobs": [],
                        "error": (
                            "Search query timed out after "
                            f"{JOBSPY_QUERY_TIMEOUT} seconds"
                        ),
                    },
                )
            )
    finally:
        executor.shutdown(wait=False, cancel_futures=True)

    jobs = deduplicate_provider_jobs(
        [
            job
            for _, result in results
            for job in result.get("jobs", [])
            if isinstance(job, dict)
        ]
    )
    jobs = jobs[:query_result_limit]
    successful_queries = [
        search_term
        for search_term, result in results
        if result.get("success")
    ]
    failed_queries = [
        {
            "searchTerm": search_term,
            "error": result.get("error") or "Provider request failed",
        }
        for search_term, result in results
        if not result.get("success")
    ]

    return {
        "source": source_name,
        "success": bool(successful_queries),
        "jobs": jobs,
        "error": None if not failed_queries else {
            "failedQueries": failed_queries,
            "successfulQueries": successful_queries,
        },
    }


def fetch_external_sources(
    search_term="",
    location="",
    job_type="",
    work_mode="",
    results_wanted=JOBSPY_RESULTS_WANTED,
):
    """
    WIDE RETRIEVAL LAYER

    Search intent and location are used for job-board scrapers that support
    them. Other providers remain broad and are filtered later by the ranker.

    The architecture is:

        Provider retrieval
              ↓
        Wide candidate pool
              ↓
        server.py hard filters
              ↓
        matcher.py relevance
              ↓
        ranking

    No hardcoded:
        roles
        skills
        technologies
        countries
        companies
    are used here.
    """

    jobspy_search_term = safe_string(search_term)
    jobspy_terms = jobspy_search_terms(
        jobspy_search_term,
        job_type,
    )
    requested_results = max(
        1,
        safe_int(results_wanted, JOBSPY_RESULTS_WANTED),
    )

    tasks = {
        "RemoteOK":
            lambda: fetch_remoteok(""),

        "Arbeitnow":
            lambda: fetch_arbeitnow(
                "",
                "",
            ),

        "Jobicy":
            lambda: fetch_jobicy(""),

        "Remotive":
            lambda: fetch_remotive(""),

        "The Muse":
            lambda: fetch_themuse(
                "",
                "",
            ),

        "LinkedIn":
            lambda: fetch_jobspy_queries(
                "linkedin",
                jobspy_terms,
                location,
                job_type,
                work_mode,
                requested_results,
            ),

        "Indeed":
            lambda: fetch_jobspy_queries(
                "indeed",
                jobspy_terms,
                location,
                job_type,
                work_mode,
                requested_results,
            ),

        "Google":
            lambda: fetch_jobspy_source(
                "google",
                jobspy_search_term,
                location,
                job_type,
                work_mode,
                requested_results,
            ),

        "Glassdoor":
            lambda: fetch_jobspy_source(
                "glassdoor",
                jobspy_search_term,
                location,
                job_type,
                work_mode,
                requested_results,
            ),

        "ZipRecruiter":
            lambda: fetch_jobspy_source(
                "zip_recruiter",
                jobspy_search_term,
                location,
                job_type,
                work_mode,
                requested_results,
            ),

        "Naukri":
            lambda: fetch_jobspy_source(
                "naukri",
                jobspy_search_term,
                location,
                job_type,
                work_mode,
                requested_results,
            ),

        "Bayt":
            lambda: fetch_jobspy_source(
                "bayt",
                jobspy_search_term,
                location,
                job_type,
                work_mode,
                requested_results,
            ),

        "BDJobs":
            lambda: fetch_jobspy_source(
                "bdjobs",
                jobspy_search_term,
                location,
                job_type,
                work_mode,
                requested_results,
            ),

        "Adzuna":
            lambda: fetch_adzuna(
                "",
                "",
            ),

        "Greenhouse":
            lambda: fetch_greenhouse(""),

        "Lever":
            lambda: fetch_lever(""),
    }

    results = []

    max_workers = len(
        tasks
    )

    executor = ThreadPoolExecutor(max_workers=max_workers)
    futures = {
        executor.submit(task): source
        for source, task in tasks.items()
    }

    try:
        completed = as_completed(
            futures,
            timeout=PROVIDER_TIMEOUT,
        )

        for future in completed:
            source = futures[
                future
            ]

            try:
                result = future.result()

                results.append(
                    normalize_provider_result(
                        source,
                        result,
                    )
                )

            except Exception as error:
                results.append(
                    {
                        "source":
                            source,

                        "success":
                            False,

                        "jobs":
                            [],

                        "error":
                            str(error),
                    }
                )
    except FuturesTimeoutError:
        for future, source in futures.items():
            if not future.done():
                future.cancel()
                results.append(
                    {
                        "source": source,
                        "success": False,
                        "jobs": [],
                        "error": f"Provider timed out after {PROVIDER_TIMEOUT} seconds",
                    }
                )
    finally:
        # Do not make one blocked scraper thread hold the HTTP refresh open.
        executor.shutdown(wait=False, cancel_futures=True)

    # Keep provider results in a stable order.
    provider_order = {
        source:
            index
        for index, source
        in enumerate(
            tasks.keys()
        )
    }

    results.sort(
        key=lambda item:
            provider_order.get(
                item.get(
                    "source",
                    "",
                ),
                999,
            )
    )

    total_jobs = sum(
        len(
            item.get(
                "jobs",
                [],
            )
        )
        for item in results
    )

    successful_sources = [
        item.get(
            "source",
            "Unknown",
        )
        for item in results
        if item.get(
            "success",
            False,
        )
    ]

    failed_sources = [
        {
            "source":
                item.get(
                    "source",
                    "Unknown",
                ),

            "error":
                item.get(
                    "error"
                ),
        }
        for item in results
        if not item.get(
            "success",
            False,
        )
    ]

    for provider in results:
        source = provider.get("source", "Unknown")
        count = len(provider.get("jobs", []))
        if provider.get("success"):
            logger.info("Provider %s returned %d jobs", source, count)
        else:
            logger.warning(
                "Provider %s failed: %s",
                source,
                provider.get("error", "unknown error"),
            )

    return {
        "success":
            True,

        "jobs":
            [
                job
                for provider in results
                for job in provider.get(
                    "jobs",
                    [],
                )
            ],

        "providers":
            results,

        "totalJobs":
            total_jobs,

        "successfulSources":
            successful_sources,

        "failedSources":
            failed_sources,
    }
