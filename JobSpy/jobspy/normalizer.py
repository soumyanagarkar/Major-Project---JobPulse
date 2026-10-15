import math
import re

from datetime import datetime, timezone

import pandas as pd


# ============================================================
# BASIC CLEANING
# ============================================================

def clean_string(value):
    if value is None:
        return ""

    try:
        if pd.isna(value):
            return ""
    except Exception:
        pass

    return str(value).strip()


# ============================================================
# NUMBER
# ============================================================

def clean_number(value):
    if value is None:
        return None

    try:
        if pd.isna(value):
            return None

        number = float(value)

        if math.isnan(number) or math.isinf(number):
            return None

        return number

    except (TypeError, ValueError):
        return None


# ============================================================
# BOOLEAN
# ============================================================

def clean_bool(value):
    if value is None:
        return False

    try:
        if pd.isna(value):
            return False
    except Exception:
        pass

    if isinstance(value, bool):
        return value

    return (
        str(value)
        .strip()
        .lower()
        == "true"
    )


# ============================================================
# HTML ENTITY DECODING
# ============================================================

def decode_html_entities(text):
    """
    Decode common HTML entities without introducing
    an additional dependency.

    Example:
        &amp;  -> &
        &nbsp; -> space
        &lt;   -> <
    """

    if not text:
        return ""

    replacements = {
        "&nbsp;": " ",
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'",
        "&apos;": "'",
    }

    for source, target in replacements.items():
        text = text.replace(
            source,
            target
        )

    return text


# ============================================================
# DESCRIPTION HELPERS
# ============================================================

def _normalize_newlines(text):
    """
    Normalize Windows / Mac / escaped line endings.
    """

    text = text.replace(
        "\r\n",
        "\n"
    )

    text = text.replace(
        "\r",
        "\n"
    )

    # Some APIs return literal "\\n"
    # instead of actual newline characters.
    text = text.replace(
        "\\n",
        "\n"
    )

    return text


def _convert_html_to_text(text):
    """
    Convert job-description HTML into readable plain text
    while PRESERVING paragraphs and lists.

    Important:
    We intentionally do NOT replace all HTML with spaces.
    That was causing the original formatting problem.
    """

    # Paragraph-like elements
    text = re.sub(
        r"<\s*(p|div|section|article|header|footer|"
        r"h1|h2|h3|h4|h5|h6)\b[^>]*>",
        "\n\n",
        text,
        flags=re.IGNORECASE,
    )

    text = re.sub(
        r"<\s*/\s*(p|div|section|article|header|footer|"
        r"h1|h2|h3|h4|h5|h6)\s*>",
        "\n\n",
        text,
        flags=re.IGNORECASE,
    )

    # Line breaks
    text = re.sub(
        r"<\s*br\s*/?\s*>",
        "\n",
        text,
        flags=re.IGNORECASE,
    )

    # List items
    text = re.sub(
        r"<\s*li\b[^>]*>",
        "\n• ",
        text,
        flags=re.IGNORECASE,
    )

    text = re.sub(
        r"<\s*/\s*li\s*>",
        "\n",
        text,
        flags=re.IGNORECASE,
    )

    # Lists create a block boundary
    text = re.sub(
        r"<\s*(ul|ol)\b[^>]*>",
        "\n",
        text,
        flags=re.IGNORECASE,
    )

    text = re.sub(
        r"<\s*/\s*(ul|ol)\s*>",
        "\n\n",
        text,
        flags=re.IGNORECASE,
    )

    # Bold / italic tags should not disappear with words glued together.
    text = re.sub(
        r"<\s*(strong|b|em|i)\b[^>]*>",
        "",
        text,
        flags=re.IGNORECASE,
    )

    text = re.sub(
        r"<\s*/\s*(strong|b|em|i)\s*>",
        "",
        text,
        flags=re.IGNORECASE,
    )

    # Links
    text = re.sub(
        r"<\s*a\b[^>]*>",
        "",
        text,
        flags=re.IGNORECASE,
    )

    text = re.sub(
        r"<\s*/\s*a\s*>",
        "",
        text,
        flags=re.IGNORECASE,
    )

    # Remove remaining HTML tags.
    text = re.sub(
        r"<[^>]+>",
        "",
        text,
    )

    return text


def _normalize_bullets(text):
    """
    Normalize different bullet styles into one consistent form.
    """

    bullet_patterns = [
        r"^\s*[-*•▪◦‣∙›]\s+",
        r"^\s*\u2022\s*",
        r"^\s*\u25aa\s*",
    ]

    lines = text.split("\n")

    normalized_lines = []

    for line in lines:
        stripped = line.strip()

        if not stripped:
            normalized_lines.append("")
            continue

        for pattern in bullet_patterns:
            if re.match(
                pattern,
                stripped
            ):
                stripped = re.sub(
                    pattern,
                    "• ",
                    stripped,
                    count=1,
                )
                break

        normalized_lines.append(
            stripped
        )

    return "\n".join(
        normalized_lines
    )


def _clean_line_spaces(text):
    """
    Clean spaces INSIDE each line without
    destroying newlines or paragraph boundaries.
    """

    lines = text.split("\n")

    cleaned_lines = []

    for line in lines:

        line = re.sub(
            r"[ \t]+",
            " ",
            line,
        )

        line = line.strip()

        cleaned_lines.append(
            line
        )

    return "\n".join(
        cleaned_lines
    )


def _collapse_excess_blank_lines(text):
    """
    Keep paragraph separation, but prevent huge empty gaps.
    """

    text = re.sub(
        r"\n[ \t]*\n[ \t]*\n+",
        "\n\n",
        text,
    )

    return text.strip()


# ============================================================
# MAIN DESCRIPTION CLEANER
# ============================================================

def clean_description(value):
    """
    Clean a job description while preserving readable structure.

    Output examples:

    About the Role

    We are looking for a software engineer...

    Requirements:
    • Python
    • React
    • MongoDB

    Responsibilities:
    • Build APIs
    • Maintain services

    The important difference from the old version is that
    newlines are preserved.
    """

    text = clean_string(value)

    if not text:
        return ""

    # Normalize line endings first.
    text = _normalize_newlines(text)

    # Decode entities that may contain HTML.
    text = decode_html_entities(text)

    # Remove scripts and styles completely.
    text = re.sub(
        r"<\s*script\b[^>]*>[\s\S]*?<\s*/\s*script\s*>",
        "",
        text,
        flags=re.IGNORECASE,
    )

    text = re.sub(
        r"<\s*style\b[^>]*>[\s\S]*?<\s*/\s*style\s*>",
        "",
        text,
        flags=re.IGNORECASE,
    )

    # Detect HTML.
    has_html = bool(
        re.search(
            r"<\s*/?\s*[a-zA-Z][^>]*>",
            text,
        )
    )

    if has_html:
        text = _convert_html_to_text(text)

    # Decode again in case HTML conversion exposed entities.
    text = decode_html_entities(text)

    # Normalize bullet characters.
    text = _normalize_bullets(text)

    # Clean spaces without destroying line breaks.
    text = _clean_line_spaces(text)

    # Remove spaces immediately around blank lines.
    text = re.sub(
        r"[ \t]*\n[ \t]*\n[ \t]*",
        "\n\n",
        text,
    )

    # Collapse excessive blank lines.
    text = _collapse_excess_blank_lines(
        text
    )

    return text


# ============================================================
# LIST NORMALIZATION
# ============================================================

def normalize_list(value):
    if value is None:
        return []

    if isinstance(value, list):
        values = value

    else:
        values = re.split(
            r"[,|;]",
            str(value),
        )

    result = []

    for item in values:

        item = str(
            item
        ).strip()

        if not item:
            continue

        if item not in result:
            result.append(
                item
            )

    return result


# ============================================================
# DATE PARSING
# ============================================================

def parse_date(value):
    if not value:
        return None

    try:
        parsed = pd.to_datetime(
            value,
            errors="coerce",
            utc=True,
        )

        if pd.isna(parsed):
            return None

        return parsed.isoformat()

    except Exception:
        return None


# ============================================================
# JOBSPY NORMALIZER
# ============================================================

def normalize_jobspy_row(row):

    job_url = clean_string(
        row.get("job_url")
    )

    direct_url = clean_string(
        row.get("job_url_direct")
    )

    # Keep the exact posting link published by the job board.
    # Never invent or rewrite it; skip rows without a real http(s) link.
    if not (
        str(job_url or "").lower().startswith(("http://", "https://"))
        or str(direct_url or "").lower().startswith(("http://", "https://"))
    ):
        return None

    return {
        "title": (
            clean_string(
                row.get("title")
            )
            or "Untitled Job"
        ),

        "company": (
            clean_string(
                row.get("company")
            )
            or "Unknown Company"
        ),

        "companyUrl": clean_string(
            row.get("company_url")
        ),

        "location": (
            clean_string(
                row.get("location")
            )
            or "Not specified"
        ),

        "isRemote": clean_bool(
            row.get("is_remote")
        ),

        "jobType": clean_string(
            row.get("job_type")
        ),

        "description": clean_description(
            row.get("description")
        ),

        "skills": normalize_list(
            row.get("skills")
        ),

        "salary": (
            clean_string(
                row.get("salary")
            )
            or "Not specified"
        ),

        "minSalary": clean_number(
            row.get("min_amount")
        ),

        "maxSalary": clean_number(
            row.get("max_amount")
        ),

        "salaryCurrency": clean_string(
            row.get("currency")
        ),

        "salarySource": clean_string(
            row.get("salary_source")
        ),

        "source": (
            clean_string(
                row.get("site")
            )
            or "JobSpy"
        ),

        "jobUrl": job_url,

        "jobUrlDirect": direct_url,

        "applicationUrl": (
            direct_url or job_url
        ),

        "postedDate": parse_date(
            row.get("date_posted")
        ),
    }


# ============================================================
# REMOTEOK NORMALIZER
# ============================================================

def normalize_remoteok(job):

    url = clean_string(
        job.get("url")
    )

    if not url:
        return None

    apply_url = clean_string(
        job.get("apply_url")
    )

    minimum = clean_number(
        job.get("salary_min")
    )

    maximum = clean_number(
        job.get("salary_max")
    )

    if (
        minimum is not None
        or maximum is not None
    ):

        minimum_text = (
            str(minimum)
            if minimum is not None
            else ""
        )

        maximum_text = (
            str(maximum)
            if maximum is not None
            else ""
        )

        salary = (
            f"{minimum_text} - "
            f"{maximum_text} USD"
        ).strip()

        salary = salary.strip(
            " -"
        )

    else:
        salary = "Not specified"

    return {
        "title": (
            clean_string(
                job.get("position")
            )
            or "Untitled Job"
        ),

        "company": (
            clean_string(
                job.get("company")
            )
            or "Unknown Company"
        ),

        "companyUrl": "",

        "location": (
            clean_string(
                job.get("location")
            )
            or "Remote"
        ),

        "isRemote": True,

        "jobType": "",

        "description": clean_description(
            job.get("description")
        ),

        "skills": normalize_list(
            job.get("tags")
        ),

        "salary": salary,

        "minSalary": minimum,

        "maxSalary": maximum,

        "salaryCurrency": (
            "USD"
            if (
                minimum is not None
                or maximum is not None
            )
            else ""
        ),

        "salarySource": "RemoteOK",

        "source": "RemoteOK",

        "jobUrl": url,

        "jobUrlDirect": apply_url,

        "applicationUrl": (
            apply_url or url
        ),

        "postedDate": parse_date(
            job.get("date")
        ),
    }


# ============================================================
# ARBEITNOW NORMALIZER
# ============================================================

def normalize_arbeitnow(job):

    url = clean_string(
        job.get("url")
    )

    if not url:
        return None

    job_types = (
        job.get("job_types")
        or []
    )

    if not isinstance(
        job_types,
        list,
    ):
        job_types = [
            job_types
        ]

    job_type_text = ", ".join(
        str(item).strip()
        for item in job_types
        if str(item).strip()
    )

    return {
        "title": (
            clean_string(
                job.get("title")
            )
            or "Untitled Job"
        ),

        "company": (
            clean_string(
                job.get("company_name")
            )
            or "Unknown Company"
        ),

        "companyUrl": "",

        "location": (
            clean_string(
                job.get("location")
            )
            or "Not specified"
        ),

        "isRemote": clean_bool(
            job.get("remote")
        ),

        "jobType": job_type_text,

        "description": clean_description(
            job.get("description")
        ),

        "skills": normalize_list(
            job.get("tags")
        ),

        "salary": "Not specified",

        "minSalary": None,

        "maxSalary": None,

        "salaryCurrency": "",

        "salarySource": "",

        "source": "Arbeitnow",

        "jobUrl": url,

        "jobUrlDirect": "",

        "applicationUrl": url,

        "postedDate": parse_date(
            job.get("created_at_iso")
            or job.get("created_at")
        ),
    }


# ============================================================
# JOBICY NORMALIZER
# ============================================================

def normalize_jobicy(job):

    url = clean_string(
        job.get("url")
    )

    if not url:
        return None

    job_type = job.get(
        "jobType"
    )

    if isinstance(
        job_type,
        list,
    ):

        job_type = ", ".join(
            str(item).strip()
            for item in job_type
            if str(item).strip()
        )

    else:

        job_type = clean_string(
            job_type
        )

    minimum = clean_number(
        job.get("salaryMin")
    )

    maximum = clean_number(
        job.get("salaryMax")
    )

    currency = clean_string(
        job.get("salaryCurrency")
    )

    if (
        minimum is not None
        or maximum is not None
    ):

        minimum_text = (
            str(minimum)
            if minimum is not None
            else ""
        )

        maximum_text = (
            str(maximum)
            if maximum is not None
            else ""
        )

        salary = (
            f"{minimum_text} - "
            f"{maximum_text} "
            f"{currency}"
        ).strip()

        salary = salary.strip(
            " -"
        )

    else:

        salary = "Not specified"

    return {
        "title": (
            clean_string(
                job.get("jobTitle")
            )
            or "Untitled Job"
        ),

        "company": (
            clean_string(
                job.get("companyName")
            )
            or "Unknown Company"
        ),

        "companyUrl": "",

        "location": (
            clean_string(
                job.get("jobGeo")
            )
            or "Remote"
        ),

        "isRemote": True,

        "jobType": job_type,

        "description": clean_description(
            job.get("jobDescription")
            or job.get("jobExcerpt")
        ),

        "skills": normalize_list(
            job.get("jobIndustry")
        ),

        "salary": salary,

        "minSalary": minimum,

        "maxSalary": maximum,

        "salaryCurrency": currency,

        "salarySource": "Jobicy",

        "source": "Jobicy",

        "jobUrl": url,

        "jobUrlDirect": url,

        "applicationUrl": url,

        "postedDate": parse_date(
            job.get("pubDate")
        ),
    }