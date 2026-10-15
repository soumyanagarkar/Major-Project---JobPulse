import { useEffect } from "react";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Briefcase,
  Clock3,
  Building2,
  Globe2,
  CheckCircle2,
  AlertCircle,
  Star,
  CalendarDays,
  Target,
} from "lucide-react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import { getValidJobUrl, getValidCompanyUrl } from "../../services/urlUtils";
import "./JobDetails.css";

function JobDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const jobKey = params.get("jobKey");

  let job = null;

  try {
    if (jobKey) {
      const storedJob = localStorage.getItem(jobKey);

      if (storedJob) {
        job = JSON.parse(storedJob);
      }
    }
  } catch (error) {
    console.error("Error loading job details:", error);
  }

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, []);

  /* =========================================================
     JOB NOT FOUND
  ========================================================= */

  if (!job) {
    return (
      <div className="job-details-page">
        <div className="details-not-found">
          <div className="not-found-icon">
            <Target size={40} />
          </div>

          <h2>Job details unavailable</h2>

          <p>
            The selected job could not be loaded.
            Please return to the dashboard and open
            the job again.
          </p>

          <button
            type="button"
            className="not-found-button"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={17} />
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     SCORES
  ========================================================= */

  const matchScore = Number(
    job.finalRankingScore ??
      job.matchScore ??
      0
  );

  const searchScore = Number(
    job.searchMatchPercentage ?? 0
  );

  const skillScore = Number(
    job.skillMatchPercentage ?? 0
  );

  const roleScore = Number(
    job.roleMatchPercentage ?? 0
  );

  const semanticScore = Number(
    job.semanticProfilePercentage ?? 0
  );

  const requirementCoverage = Number(
    job.jobRequirementCoverage ?? 0
  );

  /* =========================================================
     ARRAYS
  ========================================================= */

  const matchedSkills = Array.isArray(
    job.matchedSkills
  )
    ? job.matchedSkills
    : [];

  const missingSkills = Array.isArray(
    job.missingSkills
  )
    ? job.missingSkills
    : [];

  const matchReasons = Array.isArray(
    job.matchReasons
  )
    ? job.matchReasons
    : [];

  /* =========================================================
     URLS
  ========================================================= */

  const applicationUrl = getValidJobUrl(job);
  const companyUrl = getValidCompanyUrl(job);
  const originalJobUrl = getValidJobUrl(job);

  /* =========================================================
     SCORE CLASS
  ========================================================= */

  const scoreClass =
    matchScore >= 80
      ? "excellent"
      : matchScore >= 60
        ? "good"
        : "fair";

  return (
    <div className="job-details-page">

      <div className="job-details-container">

        {/* =================================================
            BACK BUTTON
        ================================================= */}

        <div className="details-topbar">

          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={17} />
            Back to Jobs
          </button>

        </div>

        {/* =================================================
            JOB HEADER
        ================================================= */}

        <section className="details-header">

          <div className="details-header-main">

            <div className="details-source-row">

              <span className="details-source">
                {job.source || "Job Board"}
              </span>

              {job.isRemote && (
                <span className="details-remote">
                  Remote
                </span>
              )}

            </div>

            <h1>
              {job.title || "Untitled Job"}
            </h1>

            <div className="details-company">

              <Building2 size={19} />

              <span>
                {job.company || "Unknown Company"}
              </span>

            </div>

          </div>

          <div
            className={`details-main-score ${scoreClass}`}
          >

            <strong>
              {Math.round(matchScore)}%
            </strong>

            <span>
              overall match
            </span>

          </div>

        </section>

        {/* =================================================
            META INFORMATION
        ================================================= */}

        <section className="details-info-grid">

          <InfoItem
            icon={<MapPin size={18} />}
            label="Location"
            value={
              job.location || "Not specified"
            }
          />

          <InfoItem
            icon={<Briefcase size={18} />}
            label="Job Type"
            value={
              job.jobType || "Not specified"
            }
          />

          <InfoItem
            icon={<Clock3 size={18} />}
            label="Posted"
            value={
              job.postedDate
                ? formatDate(job.postedDate)
                : "Recently"
            }
          />

          <InfoItem
            icon={<Globe2 size={18} />}
            label="Source"
            value={
              job.source || "Unknown"
            }
          />

        </section>

        {/* =================================================
            AI ANALYSIS
        ================================================= */}

        <section className="details-card">

          <div className="details-section-heading">

            <div>

              <span>
                JOBPULSE AI ANALYSIS
              </span>

              <h2>
                Why this job matches you
              </h2>

              <p>
                Search relevance, skill alignment and
                profile relevance are considered together.
              </p>

            </div>

            <div className="overall-score">
              {Math.round(matchScore)}%
            </div>

          </div>

          <div className="score-grid">

            <ScoreBar
              label="Search relevance"
              value={searchScore}
            />

            <ScoreBar
              label="Skill match"
              value={skillScore}
            />

            <ScoreBar
              label="Role alignment"
              value={roleScore}
            />

            <ScoreBar
              label="Profile relevance"
              value={semanticScore}
            />

            <ScoreBar
              label="Requirement coverage"
              value={requirementCoverage}
            />

          </div>

        </section>

        {/* =================================================
            SKILLS
        ================================================= */}

        <div className="details-two-column">

          {/* MATCHING SKILLS */}

          <section className="details-card">

            <div className="details-heading-row">

              <div className="heading-icon matching-icon">
                <CheckCircle2 size={18} />
              </div>

              <div>

                <h2>
                  Matching Skills
                </h2>

                <p>
                  Skills from your profile that
                  align with this opportunity.
                </p>

              </div>

            </div>

            {matchedSkills.length > 0 ? (

              <div className="details-skills">

                {matchedSkills.map(
                  (skill, index) => (

                    <span
                      className="detail-matched-skill"
                      key={`${skill}-${index}`}
                    >

                      <CheckCircle2 size={14} />

                      {skill}

                    </span>

                  )
                )}

              </div>

            ) : (

              <p className="details-empty">
                No matching skills were detected.
              </p>

            )}

          </section>

          {/* SKILLS TO IMPROVE */}

          <section className="details-card">

            <div className="details-heading-row">

              <div className="heading-icon missing-icon">
                <AlertCircle size={18} />
              </div>

              <div>

                <h2>
                  Skills to Improve
                </h2>

                <p>
                  Skills that may help strengthen
                  your profile for this role.
                </p>

              </div>

            </div>

            {missingSkills.length > 0 ? (

              <div className="details-skills">

                {missingSkills.map(
                  (skill, index) => (

                    <span
                      className="detail-missing-skill"
                      key={`${skill}-${index}`}
                    >
                      {skill}
                    </span>

                  )
                )}

              </div>

            ) : (

              <p className="details-empty">
                No missing profile skills were detected.
              </p>

            )}

          </section>

        </div>

        {/* =================================================
            MATCH REASONS
        ================================================= */}

        {matchReasons.length > 0 && (

          <section className="details-card">

            <div className="details-heading-row">

              <div className="heading-icon reason-icon">
                <Star size={18} />
              </div>

              <div>

                <h2>
                  Match Reasons
                </h2>

                <p>
                  Factors contributing to this ranking.
                </p>

              </div>

            </div>

            <div className="details-reasons">

              {matchReasons.map(
                (reason, index) => (

                  <div
                    className="details-reason"
                    key={`${reason}-${index}`}
                  >

                    <CheckCircle2 size={16} />

                    <span>
                      {formatInlineMarkdown(
                        reason
                      )}
                    </span>

                  </div>

                )
              )}

            </div>

          </section>

        )}

        {/* =================================================
            JOB INFORMATION
        ================================================= */}

        <section className="details-card">

          <div className="details-heading-row">

            <div className="heading-icon">
              <CalendarDays size={18} />
            </div>

            <div>

              <h2>
                Job Information
              </h2>

              <p>
                Information collected from the job source.
              </p>

            </div>

          </div>

          <div className="job-information-grid">

            <InformationRow
              label="Company"
              value={
                job.company || "Not specified"
              }
            />

            <InformationRow
              label="Location"
              value={
                job.location || "Not specified"
              }
            />

            <InformationRow
              label="Job Type"
              value={
                job.jobType || "Not specified"
              }
            />

            <InformationRow
              label="Work Mode"
              value={
                job.isRemote
                  ? "Remote"
                  : "Not specified"
              }
            />

            <InformationRow
              label="Source"
              value={
                job.source || "Unknown"
              }
            />

            <InformationRow
              label="Posted"
              value={
                job.postedDate
                  ? formatDate(job.postedDate)
                  : "Recently"
              }
            />

          </div>

        </section>

        {/* =================================================
            COMPENSATION
        ================================================= */}

        <section className="details-card">

          <div className="details-heading-row">

            <div className="heading-icon salary-icon">
              ₹
            </div>

            <div>

              <h2>
                Compensation
              </h2>

              <p>
                Salary information supplied by the source.
              </p>

            </div>

          </div>

          <div className="details-salary">

            {job.salary &&
            job.salary !== "Not specified"
              ? job.salary
              : "Salary information was not provided by the source."}

          </div>

        </section>

        {/* =================================================
            JOB DESCRIPTION
        ================================================= */}

        <section className="details-card description-card">

          <div className="details-heading-row">

            <div className="heading-icon">
              <Building2 size={18} />
            </div>

            <div>

              <h2>
                Job Description
              </h2>

              <p>
                Full job description from the listing.
              </p>

            </div>

          </div>

          <div className="formatted-description">

            <FormattedDescription
              text={job.description || ""}
            />

          </div>

        </section>

        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        <section className="details-actions">

          {companyUrl && (

            <a
              href={companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="details-secondary-button"
            >
              Visit Company
              <ExternalLink size={16} />
            </a>

          )}

          {originalJobUrl &&
            originalJobUrl !== applicationUrl && (

              <a
                href={originalJobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="details-secondary-button"
              >
                Original Listing
                <ExternalLink size={16} />
              </a>

          )}

          {applicationUrl ? (

            <a
              href={applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="details-apply-button"
            >
              Apply Now
              <ExternalLink size={17} />
            </a>

          ) : (

            <button
              type="button"
              disabled
              className="
                details-apply-button
                disabled
              "
            >
              Application unavailable
            </button>

          )}

        </section>

      </div>
    </div>
  );
}


/* ============================================================
   INFO ITEM
============================================================ */

function InfoItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="details-info-item">

      <div className="info-item-icon">
        {icon}
      </div>

      <div className="info-item-content">

        <small>
          {label}
        </small>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  );
}


/* ============================================================
   INFORMATION ROW
============================================================ */

function InformationRow({
  label,
  value,
}) {
  return (
    <div className="information-row">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}


/* ============================================================
   SCORE BAR
============================================================ */

function ScoreBar({
  label,
  value,
}) {
  const safeValue = Math.max(
    0,
    Math.min(
      100,
      Number(value) || 0
    )
  );

  return (
    <div className="details-score-bar">

      <div className="details-score-label">

        <span>
          {label}
        </span>

        <strong>
          {Math.round(safeValue)}%
        </strong>

      </div>

      <div className="details-track">

        <div
          className="details-fill"
          style={{
            width: `${safeValue}%`,
          }}
        />

      </div>

    </div>
  );
}


/* ============================================================
   DESCRIPTION FORMATTER
============================================================ */

function FormattedDescription({
  text,
}) {
  if (!text) {
    return (
      <p className="details-empty">
        No job description available.
      </p>
    );
  }

  let cleaned = String(text);

  /* Convert escaped newlines */
  cleaned = cleaned
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  /* Decode HTML entities */
  cleaned = decodeHtmlEntities(cleaned);

  /* Convert HTML into readable text */
  cleaned = convertHtmlToText(cleaned);

  /* Normalize markdown */
  cleaned = normalizeMarkdown(cleaned);

  return (
    <div className="plain-description">
      {renderDescriptionBlocks(cleaned)}
    </div>
  );
}


/* ============================================================
   HTML TO READABLE TEXT
============================================================ */

function convertHtmlToText(
  text
) {
  let result = text;

  /* Remove scripts */

  result = result.replace(
    /<script[\s\S]*?<\/script>/gi,
    ""
  );

  /* Remove styles */

  result = result.replace(
    /<style[\s\S]*?<\/style>/gi,
    ""
  );

  /* Line breaks */

  result = result.replace(
    /<br\s*\/?>/gi,
    "\n"
  );

  /* Block elements */

  result = result.replace(
    /<(p|div|section|article|header|footer|h1|h2|h3|h4|h5|h6)[^>]*>/gi,
    "\n\n"
  );

  result = result.replace(
    /<\/(p|div|section|article|header|footer|h1|h2|h3|h4|h5|h6)>/gi,
    "\n\n"
  );

  /* List items */

  result = result.replace(
    /<li[^>]*>/gi,
    "\n• "
  );

  result = result.replace(
    /<\/li>/gi,
    "\n"
  );

  /* Lists */

  result = result.replace(
    /<ul[^>]*>/gi,
    "\n"
  );

  result = result.replace(
    /<\/ul>/gi,
    "\n\n"
  );

  result = result.replace(
    /<ol[^>]*>/gi,
    "\n"
  );

  result = result.replace(
    /<\/ol>/gi,
    "\n\n"
  );

  /* Remove remaining HTML tags */

  result = result.replace(
    /<[^>]+>/g,
    ""
  );

  return result;
}


/* ============================================================
   MARKDOWN NORMALIZATION
============================================================ */

function normalizeMarkdown(
  text
) {
  let result = text;

  /*
   * Remove bold markdown markers.
   * The renderer below will make headings that are
   * explicitly identified bold.
   */

  result = result.replace(
    /\*\*(.*?)\*\*/g,
    "$1"
  );

  result = result.replace(
    /__(.*?)__/g,
    "$1"
  );

  /* Markdown headings */

  result = result.replace(
    /^\s*#{1,6}\s+/gm,
    ""
  );

  /* Markdown links */

  result = result.replace(
    /\[([^\]]+)\]\([^)]+\)/g,
    "$1"
  );

  /*
   * Convert markdown bullets to our standard bullet.
   */

  result = result.replace(
    /^[ \t]*[-+*]\s+/gm,
    "• "
  );

  /*
   * Remove remaining stray asterisks.
   */

  result = result.replace(
    /\*/g,
    ""
  );

  /*
   * Normalize spaces while preserving newlines.
   */

  result = result
    .split("\n")
    .map(
      (line) =>
        line
          .replace(/[ \t]+/g, " ")
          .trim()
    )
    .join("\n");

  /*
   * Maximum two consecutive newlines.
   */

  result = result.replace(
    /\n{3,}/g,
    "\n\n"
  );

  return result.trim();
}


/* ============================================================
   DESCRIPTION BLOCK RENDERER
============================================================ */

function renderDescriptionBlocks(
  text
) {
  const lines =
    text
      .split("\n")
      .map(
        (line) =>
          line.trim()
      );

  const blocks = [];

  let current = [];


  for (
    const line of lines
  ) {

    if (!line) {

      if (
        current.length > 0
      ) {

        blocks.push(
          current
        );

        current = [];
      }

      continue;
    }

    current.push(
      line
    );
  }


  if (
    current.length > 0
  ) {
    blocks.push(
      current
    );
  }


  return blocks.map(
    (
      block,
      blockIndex
    ) => {

      /* ==============================================
         BULLET LIST
      ============================================== */

      if (
        block.length > 0 &&
        block.every(
          (line) =>
            line.startsWith("• ")
        )
      ) {

        return (
          <ul
            key={blockIndex}
            className="description-list"
          >

            {block.map(
              (
                line,
                index
              ) => (

                <li
                  key={index}
                  className="description-list-item"
                >

                  {formatInlineMarkdown(
                    line.replace(
                      /^•\s*/,
                      ""
                    )
                  )}

                </li>

              )
            )}

          </ul>
        );
      }


      /* ==============================================
         NUMBERED LIST
      ============================================== */

      if (
        block.length > 0 &&
        block.every(
          (line) =>
            /^\d+[.)]\s+/.test(
              line
            )
        )
      ) {

        return (
          <ol
            key={blockIndex}
            className="
              description-list
              numbered
            "
          >

            {block.map(
              (
                line,
                index
              ) => (

                <li
                  key={index}
                  className="description-list-item"
                >

                  {formatInlineMarkdown(
                    line.replace(
                      /^\d+[.)]\s+/,
                      ""
                    )
                  )}

                </li>

              )
            )}

          </ol>
        );
      }


      /* ==============================================
         HEADING + CONTENT
      ============================================== */

      if (
        block.length > 1 &&
        isDescriptionHeading(
          block[0]
        )
      ) {

        return (
          <div
            key={blockIndex}
            className="description-block"
          >

            <h3 className="description-heading">

              {formatInlineMarkdown(
                removeHeadingColon(
                  block[0]
                )
              )}

            </h3>

            <p className="description-paragraph">

              {block
                .slice(1)
                .map(
                  (
                    line,
                    index
                  ) => (
                    <span
                      key={index}
                    >

                      {index > 0
                        ? " "
                        : ""}

                      {formatInlineMarkdown(
                        line
                      )}

                    </span>
                  )
                )}

            </p>

          </div>
        );
      }


      /* ==============================================
         SINGLE HEADING
      ============================================== */

      if (
        block.length === 1 &&
        isDescriptionHeading(
          block[0]
        )
      ) {

        return (
          <h3
            key={blockIndex}
            className="description-heading"
          >

            {formatInlineMarkdown(
              removeHeadingColon(
                block[0]
              )
            )}

          </h3>
        );
      }


      /* ==============================================
         NORMAL PARAGRAPH
      ============================================== */

      return (
        <p
          key={blockIndex}
          className="description-paragraph"
        >

          {block.map(
            (
              line,
              index
            ) => (

              <span
                key={index}
              >

                {index > 0
                  ? " "
                  : ""}

                {formatInlineMarkdown(
                  line
                )}

              </span>

            )
          )}

        </p>
      );
    }
  );
}


/* ============================================================
   FORMAT INLINE MARKDOWN
   IMPORTANT: ONLY ONE FUNCTION WITH THIS NAME
============================================================ */

function formatInlineMarkdown(
  text
) {
  const value =
    String(text || "");

  /*
   * At this stage stray single * characters
   * have already been removed.
   *
   * This function mainly handles any bold
   * markers that survive.
   */

  const regex =
    /(\*\*[^*]+\*\*|__[^_]+__)/g;

  const parts =
    value.split(regex);

  return parts.map(
    (
      part,
      index
    ) => {

      if (
        part.startsWith("**") &&
        part.endsWith("**") &&
        part.length >= 4
      ) {

        return (
          <strong
            key={index}
          >
            {part.slice(
              2,
              -2
            )}
          </strong>
        );
      }


      if (
        part.startsWith("__") &&
        part.endsWith("__") &&
        part.length >= 4
      ) {

        return (
          <strong
            key={index}
          >
            {part.slice(
              2,
              -2
            )}
          </strong>
        );
      }


      return (
        <span key={index}>
          {part.replace(
            /\*/g,
            ""
          )}
        </span>
      );
    }
  );
}


/* ============================================================
   DESCRIPTION HEADING DETECTOR
============================================================ */

function isDescriptionHeading(
  line
) {
  const text =
    String(line || "").trim();


  if (
    !text ||
    text.length > 100
  ) {
    return false;
  }


  /*
   * Example:
   * Requirements:
   * Responsibilities:
   */

  if (
    text.endsWith(":")
  ) {
    return true;
  }


  /*
   * Example:
   * REQUIREMENTS
   * RESPONSIBILITIES
   */

  const letters =
    text.replace(
      /[^A-Za-z]/g,
      ""
    );


  if (
    letters.length >= 4 &&
    letters ===
      letters.toUpperCase()
  ) {
    return true;
  }


  return false;
}


/* ============================================================
   CLEAN HEADING
============================================================ */

function removeHeadingColon(
  text
) {
  return String(text)
    .replace(
      /:\s*$/,
      ""
    )
    .trim();
}


/* ============================================================
   HTML ENTITIES
============================================================ */

function decodeHtmlEntities(
  text
) {
  const textarea =
    document.createElement(
      "textarea"
    );

  textarea.innerHTML =
    text;

  return textarea.value;
}


/* ============================================================
   DATE FORMAT
============================================================ */

function formatDate(
  value
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Recently";
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}


export default JobDetails;