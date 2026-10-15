/**
 * URL Sanitization and Fallback Utility for JobPulse
 */

export const getValidJobUrl = (job) => {
  if (!job) return "";
  const rawUrl = (
    job.jobUrl ||
    job.sourceUrl ||
    job.applicationUrl ||
    job.jobUrlDirect ||
    ""
  ).trim();

  const isInvalid =
    !rawUrl ||
    rawUrl === "#" ||
    /^(javascript|data):/i.test(rawUrl);

  return isInvalid ? "" : rawUrl;
};

export const getValidCompanyUrl = (job) => {
  if (!job) return "";
  const rawUrl = (job.companyUrl || "").trim();
  const isInvalid =
    !rawUrl ||
    rawUrl === "#" ||
    /^(javascript|data):/i.test(rawUrl);

  return isInvalid ? "" : rawUrl;
};
