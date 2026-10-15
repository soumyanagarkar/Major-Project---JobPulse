const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, default: "Unknown", trim: true },
  companyUrl: { type: String, default: "" },
  location: { type: String, default: "Not specified" },
  sourceSearchLocation: { type: String, default: "" },
  isRemote: { type: Boolean, default: false },
  jobType: { type: String, default: "" },
  employmentType: { type: String, default: "" },
  experience: { type: String, default: "" },
  experienceLevel: { type: String, default: "" },
  workMode: { type: String, default: "" },
  description: { type: String, default: "" },
  requirements: { type: String, default: "" },
  qualifications: { type: String, default: "" },
  responsibilities: { type: String, default: "" },
  skills: { type: [String], default: [] },
  salary: { type: String, default: "Not specified" },
  minSalary: { type: Number, default: null },
  maxSalary: { type: Number, default: null },
  salaryCurrency: { type: String, default: "" },
  salarySource: { type: String, default: "" },
  salaryPeriod: { type: String, default: "" },
  minExperienceYears: { type: Number, default: null },
  maxExperienceYears: { type: Number, default: null },
  experienceSource: { type: String, default: "" },
  source: { type: String, default: "Unknown" },
  jobUrl: { type: String, required: true },
  jobUrlDirect: { type: String, default: "" },
  applicationUrl: { type: String, default: "" },
  postedDate: { type: Date, default: null },
  scrapedAt: { type: Date, default: Date.now },
  searchMatchPercentage: { type: Number, default: 0, min: 0, max: 100 },
  finalRankingScore: { type: Number, default: 0, min: 0, max: 100 },
  matchScore: { type: Number, default: 0, min: 0, max: 100 },
  semanticProfilePercentage: { type: Number, default: 0, min: 0, max: 100 },
  roleMatchPercentage: { type: Number, default: 0, min: 0, max: 100 },
  skillMatchPercentage: { type: Number, default: 0, min: 0, max: 100 },
  jobRequirementCoverage: { type: Number, default: 0, min: 0, max: 100 },
  detectedJobSkills: { type: [String], default: [] },
  matchedSkills: { type: [String], default: [] },
  missingSkills: { type: [String], default: [] },
  matchReasons: { type: [String], default: [] },
}, { timestamps: true });

jobSchema.index({ jobUrl: 1 }, { unique: true });
jobSchema.index({ title: "text", company: "text", description: "text" });
jobSchema.index({ finalRankingScore: -1 });
jobSchema.index({ postedDate: -1 });

module.exports = mongoose.model("Job", jobSchema);
