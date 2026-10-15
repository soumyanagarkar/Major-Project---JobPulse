const Job = require("../models/Job");
const User = require("../models/User");

const clean = (v) => (v === undefined || v === null ? "" : String(v).trim());
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const rx = (s) => new RegExp(escapeRegex(s), "i");

// Fabricated links from older cleanup scripts are never returned
const FAKE_URL_CLAUSE = {
  $nor: [
    { jobUrl: /jobpulse_id=/i },
    { jobUrl: /linkedin\.com\/jobs\/search/i },
  ],
};

const MAX_LIMIT = 500;
const DEFAULT_LIMIT = 200;

const jobTypeClause = (jobType) => {
  const jt = clean(jobType).toLowerCase().replace(/[\s_-]/g, "");
  if (!jt) return null;
  if (jt.includes("intern"))
    return { $or: [{ jobType: /intern/i }, { employmentType: /intern/i }, { title: /intern/i }] };
  if (jt.includes("full"))
    return { $or: [{ jobType: /full[\s_-]?time/i }, { employmentType: /full[\s_-]?time/i }] };
  if (jt.includes("part"))
    return { $or: [{ jobType: /part[\s_-]?time/i }, { employmentType: /part[\s_-]?time/i }] };
  if (jt.includes("contract"))
    return { $or: [{ jobType: /contract|freelance|temporary/i }, { employmentType: /contract|freelance|temporary/i }] };
  return { $or: [{ jobType: rx(jobType) }, { employmentType: rx(jobType) }] };
};

const workModeClause = (workMode) => {
  const wm = clean(workMode).toLowerCase().replace(/[\s_-]/g, "");
  if (!wm) return null;
  if (wm.includes("remote"))
    return { $or: [{ isRemote: true }, { workMode: /remote/i }] };
  if (wm.includes("hybrid"))
    return { $or: [{ workMode: /hybrid/i }, { location: /hybrid/i }] };
  if (wm.includes("site") || wm.includes("office")) {
    return {
      $or: [
        { workMode: /on[\s_-]?site|office/i },
        {
          $and: [
            { isRemote: { $ne: true } },
            { $or: [{ workMode: "" }, { workMode: null }, { workMode: { $exists: false } }] },
            { location: { $not: /hybrid|remote/i } },
          ],
        },
      ],
    };
  }
  return { workMode: rx(workMode) };
};

const dateClause = (hours) => {
  const h = Number(hours);
  if (!hours || !Number.isFinite(h) || h <= 0) return null;
  const cutoff = new Date(Date.now() - h * 3600 * 1000);
  return {
    $or: [
      { postedDate: { $gte: cutoff } },
      { postedDate: null, scrapedAt: { $gte: cutoff } },
    ],
  };
};

const locationClause = (location) => {
  const loc = clean(location);
  if (!loc) return null;
  const parts = loc.split(",").map((p) => p.trim()).filter(Boolean);
  const options = [{ location: rx(loc) }];
  if (parts.length > 1) options.push({ location: rx(parts[0]) });
  return { $or: options };
};

const sourceClause = (source) => {
  const s = clean(source);
  return s ? { source: rx(s) } : null;
};

// Every word typed must appear somewhere in the job
const searchClauses = (searchTerm) => {
  const tokens = clean(searchTerm).split(/\s+/).filter((t) => t.length >= 2);
  return tokens.map((tok) => {
    const r = rx(tok);
    return {
      $or: [
        { title: r }, { company: r }, { skills: r },
        { detectedJobSkills: r }, { location: r }, { description: r },
      ],
    };
  });
};

const buildQuery = (params) => {
  const and = [FAKE_URL_CLAUSE];
  [
    searchClauses(params.searchTerm),
    [
      jobTypeClause(params.jobType),
      workModeClause(params.workMode),
      dateClause(params.postedWithin),
      locationClause(params.location),
      sourceClause(params.source),
    ],
  ]
    .flat(2)
    .filter(Boolean)
    .forEach((c) => and.push(c));
  return and.length === 1 ? and[0] : { $and: and };
};

const getProfile = async (userId) => {
  if (!userId) return {};
  try {
    const u = await User.findById(userId).lean();
    if (!u) return {};
    return {
      targetRole: clean(u.targetRole),
      skills: [
        ...(Array.isArray(u.skills) ? u.skills : []),
        ...(Array.isArray(u.resumeSkills) ? u.resumeSkills : []),
      ].map(clean).filter(Boolean),
    };
  } catch {
    return {};
  }
};

const scoreJob = (job, searchTerm, profile) => {
  const title = clean(job.title).toLowerCase();
  const jobSkills = [...(job.skills || []), ...(job.detectedJobSkills || [])].map((s) =>
    clean(s).toLowerCase()
  );
  const haystack = `${title} ${clean(job.company).toLowerCase()} ${jobSkills.join(" ")}`;

  let score = 0;
  const term = clean(searchTerm).toLowerCase();

  if (term) {
    if (title.includes(term)) score += 50;
    const tokens = term.split(/\s+/).filter((t) => t.length >= 2);
    if (tokens.length) {
      const hit = tokens.filter((t) => haystack.includes(t)).length;
      score += (hit / tokens.length) * 40;
    }
  }

  const role = clean(profile.targetRole).toLowerCase();
  if (role && title.includes(role)) score += term ? 5 : 40;

  const pSkills = (profile.skills || []).map((s) => s.toLowerCase());
  if (pSkills.length) {
    const matched = pSkills.filter((s) => jobSkills.some((js) => js.includes(s)));
    score += Math.min(matched.length / Math.min(pSkills.length, 8), 1) * (term ? 5 : 50);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
};

// GET /api/dashboard/jobs
const getDashboardJobs = async (req, res) => {
  try {
    const params = {
      searchTerm: clean(req.query.search_term ?? req.query.searchTerm ?? req.query.q),
      location: clean(req.query.location),
      jobType: clean(req.query.job_type ?? req.query.jobType),
      workMode: clean(req.query.work_mode ?? req.query.workMode),
      postedWithin: clean(req.query.hours_old ?? req.query.postedWithin),
      source: clean(req.query.source ?? req.query.sites),
    };

    const requested = Number(req.query.limit);
    const limit =
      Number.isFinite(requested) && requested > 0
        ? Math.min(Math.floor(requested), MAX_LIMIT)
        : DEFAULT_LIMIT;

    const query = buildQuery(params);

    const [docs, total] = await Promise.all([
      Job.find(query).sort({ postedDate: -1, scrapedAt: -1 }).limit(MAX_LIMIT).lean(),
      Job.countDocuments(query),
    ]);

    const userId = req.user?._id || req.user?.id || req.user?.userId;
    const profile = await getProfile(userId);

    const jobs = docs
      .map((job) => {
        const score = scoreJob(job, params.searchTerm, profile);
        return {
          ...job,
          matchScore: score,
          finalRankingScore: score,
          searchMatchPercentage: params.searchTerm ? score : job.searchMatchPercentage,
        };
      })
      .sort((a, b) => b.finalRankingScore - a.finalRankingScore)
      .slice(0, limit);

    const sourceSummary = {};
    for (const j of jobs) {
      const name = clean(j.source) || "Job Board";
      sourceSummary[name] = (sourceSummary[name] || 0) + 1;
    }

    return res.json({
      success: true,
      count: jobs.length,
      total,
      jobs,
      sourceSummary,
      message: jobs.length === 0 ? "No jobs match your search and filters." : undefined,
      search: {
        search_term: params.searchTerm,
        location: params.location,
        job_type: params.jobType,
        work_mode: params.workMode,
        hours_old: params.postedWithin,
        source: params.source,
        searchEntered: Boolean(params.searchTerm),
        effectiveQuery: params.searchTerm || profile.targetRole || "All Jobs",
      },
    });
  } catch (error) {
    console.error("getDashboardJobs error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard jobs.",
      error: error.message,
    });
  }
};

// GET /api/dashboard/filters
const getDashboardFilters = async (req, res) => {
  try {
    const sources = await Job.aggregate([
      { $match: FAKE_URL_CLAUSE },
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    return res.json({
      success: true,
      sources: sources.filter((s) => s._id).map((s) => ({ name: s._id, count: s.count })),
    });
  } catch (error) {
    console.error("getDashboardFilters error:", error);
    return res.status(500).json({ success: false, message: "Unable to load filters." });
  }
};

module.exports = { getDashboardJobs, getDashboardFilters };