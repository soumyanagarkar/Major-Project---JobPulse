const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

// =====================================================
// 1. EXTRACT RAW TEXT FROM PDF / DOCX
// =====================================================

const extractRawText = async (filePath) => {
  const extension = path.extname(filePath).toLowerCase();

  // -------------------------
  // PDF
  // -------------------------
  if (extension === ".pdf") {
    const buffer = fs.readFileSync(filePath);

    const parser = new PDFParse({
      data: buffer,
    });

    try {
      const result = await parser.getText();
      return result.text || "";
    } finally {
      await parser.destroy();
    }
  }

  // -------------------------
  // DOCX
  // -------------------------
  if (extension === ".docx") {
    const result = await mammoth.extractRawText({
      path: filePath,
    });

    return result.value || "";
  }

  throw new Error(
    "Unsupported resume format. Only PDF and DOCX are supported."
  );
};

// =====================================================
// 2. CLEAN TEXT
// =====================================================

const cleanText = (text) => {
  return (text || "")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")

    // Remove PDF page-number/footer artifacts
    .replace(
      /\s*[-–—]\s*\d+\s+of\s+\d+\s*[-–—]*\s*$/gim,
      ""
    )

    .replace(
      /^\s*page\s+\d+\s*(?:of|\/)\s*\d+\s*$/gim,
      ""
    )

    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

// =====================================================
// 3. NORMALIZE LINE
// =====================================================

const normalizeLine = (line) => {
  return line
    .replace(/^[•●▪◦■□○◆◇*-]\s*/, "")
    .replace(/^\d+[\.)]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
};

// =====================================================
// 4. SECTION DETECTION
// =====================================================

const SECTION_ALIASES = {
  education: [
    "education",
    "educational background",
    "academic background",
    "academic qualification",
    "academic qualifications",
    "qualifications",
    "education qualification",
    "educational qualifications",
  ],

  projects: [
    "projects",
    "project",
    "academic projects",
    "academic project",
    "personal projects",
    "personal project",
    "key projects",
    "key project",
    "major projects",
    "major project",
    "project experience",
    "project work",
    "projects and research",
  ],

  experience: [
    "experience",
    "work experience",
    "professional experience",
    "employment",
    "employment history",
    "work history",
    "internship",
    "internships",
    "internship experience",
    "professional background",
    "work experience and internships",
  ],

  certifications: [
  "certifications",
  "certification",
  "certificates",
  "certificate",
  "courses and certifications",
  "courses & certifications",
  "certifications and courses",
  "certifications & courses",
  "certifications courses",
  "courses certifications",
  "certifications and training",
  "certifications training",
],

  skills: [
    "skills",
    "technical skills",
    "technical skill",
    "technical expertise",
    "core skills",
    "key skills",
    "skills and technologies",
    "technologies",
    "technical proficiencies",
    "technical proficiency",
  ],

  achievements: [
    "achievements",
    "achievement",
    "awards",
    "awards and achievements",
    "honors",
    "honours",
  ],

  languages: [
    "languages",
    "languages known",
    "language proficiency",
  ],
};

// Convert heading into a comparable form
const normalizeHeading = (line) => {
  return (line || "")
    .toLowerCase()
    .replace(/[&/|,:-]+/g, " ")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const detectSection = (line) => {
  const normalized = normalizeHeading(line);

  for (const [section, aliases] of Object.entries(SECTION_ALIASES)) {
    const matches = aliases.some(
      (alias) => normalizeHeading(alias) === normalized
    );

    if (matches) {
      return section;
    }
  }

  return null;
};
// =====================================================
// 5. CREATE SECTION BLOCKS
// =====================================================

const getSections = (text) => {
  const lines = cleanText(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const sections = {
    header: [],
    education: [],
    projects: [],
    experience: [],
    certifications: [],
    skills: [],
    achievements: [],
    languages: [],
    other: [],
  };

  let currentSection = "header";

  for (const originalLine of lines) {
    const line = originalLine.trim();

    const detectedSection = detectSection(line);

    if (detectedSection) {
      currentSection = detectedSection;
      continue;
    }

    sections[currentSection].push(line);
  }

  return sections;
};

// =====================================================
// 6. SKILLS
// =====================================================

const extractSkills = (text) => {
  const sections = getSections(text);
  const skills = [];

  for (const sourceLine of sections.skills) {
    const line = normalizeLine(sourceLine);
    const colon = line.indexOf(":");
    const values = colon >= 0 ? line.slice(colon + 1) : line;

    for (const value of values.split(/[,;|•]+/)) {
      const skill = value.trim().replace(/^[-–—\s]+|[-–—\s]+$/g, "");
      if (skill && !skills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
        skills.push(skill);
      }
    }
  }

  return skills;
};

// =====================================================
// 7. DATE EXTRACTION
// =====================================================

const extractDateRange = (text) => {
  const value = text || "";

  const date =
    String.raw`(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)`;

  const dateRangeRegex = new RegExp(
    String.raw`((?:${date}\.?\s+\d{4}|\d{1,2}/\d{4}|\d{4}))\s*(?:-|–|—|to)\s*((?:${date}\.?\s+\d{4}|\d{1,2}/\d{4}|\d{4}|Present|Current))`,
    "i"
  );

  const match = value.match(dateRangeRegex);

  if (match) {
    return {
      startDate: match[1].trim(),
      endDate: match[2].trim(),
    };
  }

  return {
    startDate: "",
    endDate: "",
  };
};
// =====================================================
// 8. EDUCATION
// =====================================================

// =====================================================
// 8. EDUCATION
// =====================================================

const extractEducation = (sectionLines) => {
  const education = [];

  const lines = sectionLines
    .map(normalizeLine)
    .filter(Boolean);

  if (!lines.length) {
    return education;
  }

  // ------------------------------------------------
  // Degree / education qualification detection
  // ------------------------------------------------

  const educationRegex =
    /\b(?:Ph\.?\s*D\.?|Doctorate|M\.?\s*Tech|M\.?\s*E|MCA|MBA|M\.?\s*Sc|M\.?\s*Com|MA|MS|B\.?\s*Tech|B\.?\s*E|BCA|BBA|B\.?\s*Sc|B\.?\s*Com|BA|BS|Diploma|HSC|SSC|12th|10th|Higher Secondary|Senior Secondary|Secondary School)\b/i;

  const gradeRegex =
    /\b(?:CGPA|GPA|Percentage|Percent|Score|Marks?)\s*[:\-]?\s*[\d.]+(?:\s*\/\s*[\d.]+)?%?/i;

  const dateRangeRegex =
    /((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4}))\s*(?:-|–|—|to)\s*((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4}|Present|Current))/i;

  const yearRegex = /\b(?:19|20)\d{2}\b/g;

  const institutionRegex =
    /\b(?:college|university|institute|school|academy)\b/i;

  // ------------------------------------------------
  // Find education record starts
  // ------------------------------------------------

  const educationIndexes = [];

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(educationRegex);

    if (!match) {
      continue;
    }

    educationIndexes.push(i);
  }

  // ------------------------------------------------
  // Process each education record
  // ------------------------------------------------

  for (let i = 0; i < educationIndexes.length; i++) {
    const degreeIndex = educationIndexes[i];

    const nextDegreeIndex =
      educationIndexes[i + 1] !== undefined
        ? educationIndexes[i + 1]
        : lines.length;

    /*
     * Start from the degree line.
     *
     * We additionally inspect the previous two lines
     * because many resumes put:
     *
     * College Name
     * B.Tech
     *
     * instead of:
     *
     * B.Tech
     * College Name
     */

    let blockStart = degreeIndex;

    for (
      let j = Math.max(0, degreeIndex - 2);
      j < degreeIndex;
      j++
    ) {
      if (
        institutionRegex.test(lines[j]) ||
        dateRangeRegex.test(lines[j]) ||
        yearRegex.test(lines[j])
      ) {
        blockStart = j;
      }
    }

    const block = lines.slice(
      blockStart,
      nextDegreeIndex
    );

    if (!block.length) {
      continue;
    }

    const combined = block.join(" | ");

    // ------------------------------------------------
    // Degree
    // ------------------------------------------------

    const degreeMatch = lines[degreeIndex].match(
      educationRegex
    );

    if (!degreeMatch) {
      continue;
    }

    const degree = degreeMatch[0].trim();

    // ------------------------------------------------
    // Institution
    // ------------------------------------------------

    let institution = "";

    const institutionLine = block.find((line) =>
      institutionRegex.test(line)
    );

    if (institutionLine) {
      institution = institutionLine.trim();

      // If degree and institution are on same line,
      // remove the degree from institution.
      const escapedDegree = degree.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      institution = institution
        .replace(
          new RegExp(
            "^" +
              escapedDegree +
              "\\s*[-:|,]?\\s*",
            "i"
          ),
          ""
        )
        .trim();

      // If institution comes after the degree,
      // remove anything before the institution.
      institution = institution
        .replace(/^[|,:;\-–—]+/, "")
        .trim();
    }

    // ------------------------------------------------
    // Grade
    // ------------------------------------------------

    let grade = "";

    for (const line of block) {
      const gradeMatch = line.match(gradeRegex);

      if (gradeMatch) {
        grade = gradeMatch[0].trim();
        break;
      }
    }

    // ------------------------------------------------
    // Dates
    // ------------------------------------------------

    let startDate = "";
    let endDate = "";

    const dateMatch = combined.match(dateRangeRegex);

    if (dateMatch) {
      startDate = dateMatch[1].trim();
      endDate = dateMatch[2].trim();
    } else {
      const years = combined.match(yearRegex) || [];

      if (years.length >= 2) {
        startDate = years[0];
        endDate = years[1];
      } else if (years.length === 1) {
        endDate = years[0];
      }
    }

    // ------------------------------------------------
    // Field of Study
    // ------------------------------------------------

    let field = "";

    // Explicit field labels
    const fieldMatch = combined.match(
      /\b(?:field of study|major|specialization|branch|stream)\s*[:\-]?\s*([^|,;]+)/i
    );

    if (fieldMatch) {
      field = fieldMatch[1]
        .replace(
          /\b(?:CGPA|GPA|Percentage|Percent|Score|Marks?)\b.*$/i,
          ""
        )
        .trim();
    }

    // Example:
    // B.Tech in Information Technology
    if (!field) {
      const directFieldMatch = combined.match(
        /\b(?:Ph\.?\s*D\.?|M\.?\s*Tech|M\.?\s*E|MCA|MBA|M\.?\s*Sc|M\.?\s*Com|B\.?\s*Tech|B\.?\s*E|BCA|BBA|B\.?\s*Sc|B\.?\s*Com|BA|BS)\s+in\s+([^|,;]+)/i
      );

      if (directFieldMatch) {
        field = directFieldMatch[1]
          .replace(
            /\b(?:CGPA|GPA|Percentage|Percent|Score|Marks?)\b.*$/i,
            ""
          )
          .trim();
      }
    }

    // ------------------------------------------------
    // Avoid duplicate records
    // ------------------------------------------------

    const duplicate = education.some(
      (item) =>
        item.degree.toLowerCase() ===
          degree.toLowerCase() &&
        item.institution.toLowerCase() ===
          institution.toLowerCase()
    );

    if (!duplicate) {
      education.push({
        institution,
        degree,
        field,
        startDate,
        endDate,
        grade,
      });
    }
  }

  return education;
};
// =====================================================
// 9. PROJECTS
// =====================================================

const extractProjects = (sectionLines) => {
  const projects = [];

  const lines = sectionLines
    .map(normalizeLine)
    .filter(Boolean);

  if (!lines.length) {
    return projects;
  }

  const dateRegex =
    /\b(?:19|20)\d{2}\b|\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{4}\b/i;

  const certificationRegex =
    /\b(?:certification|certificate|certified|course|training|workshop|credential)\b/i;

  let currentProject = null;

  const saveProject = () => {
    if (!currentProject) {
      return;
    }

    const result = currentProject.lines
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (
      result &&
      !projects.some(
        (project) =>
          project.toLowerCase() === result.toLowerCase()
      )
    ) {
      projects.push(result);
    }

    currentProject = null;
  };

  for (const line of lines) {

    // Never allow certification content
    // to become project content.
    if (certificationRegex.test(line)) {
      saveProject();
      continue;
    }

    const hasProjectSeparator =
      /\s*(?:\||—|–)\s*/.test(line);

    const hasDescriptionSeparator =
      /\s*[:|—–]\s*/.test(line);

    const looksLikeProjectTitle =
      line.length <= 180 &&
      !dateRegex.test(line) &&
      (hasProjectSeparator || hasDescriptionSeparator);

    if (looksLikeProjectTitle) {

      if (currentProject) {
        saveProject();
      }

      currentProject = {
        lines: [line],
      };

      continue;
    }

    if (currentProject) {
      currentProject.lines.push(line);
    }
  }

  saveProject();

  return projects;
};
// =====================================================
// 10. EXPERIENCE
// =====================================================

const extractExperience = (sectionLines) => {
  const experience = [];

  const lines = sectionLines
    .map(normalizeLine)
    .filter(Boolean);

  if (!lines.length) {
    return experience;
  }

  const dateRangeRegex =
    /((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4}))\s*(?:-|–|—|to)\s*((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4}|Present|Current))/i;

  const roleRegex =
    /\b(?:intern|internship|developer|engineer|analyst|manager|designer|trainee|associate|consultant|software|administrator|specialist|architect|lead|executive)\b/i;

  let current = null;

  const saveCurrent = () => {
    if (!current) {
      return;
    }

    const result = current.lines
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (
      result &&
      !experience.some(
        (item) =>
          item.toLowerCase() ===
          result.toLowerCase()
      )
    ) {
      experience.push(result);
    }

    current = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const nextLine =
      lines[i + 1] || "";

    const hasDate =
      dateRangeRegex.test(line);

    const nextLineHasDate =
      dateRangeRegex.test(nextLine);

    const isBullet =
      /^[•●▪◦■□○◆◇*-]\s*/.test(
        line
      );

    // ------------------------------------------------
    // A date-bearing line is a strong experience
    // boundary.
    // ------------------------------------------------

    if (hasDate) {
      if (current && current.hasDate) {
        saveCurrent();
      }

      if (!current) {
        current = {
          lines: [],
          hasDate: false,
        };
      }

      current.lines.push(line);
      current.hasDate = true;

      continue;
    }

    // ------------------------------------------------
    // If a company/header line is immediately followed
    // by a date line, start the experience here.
    // ------------------------------------------------

    if (
      !current &&
      !isBullet &&
      nextLineHasDate
    ) {
      current = {
        lines: [line],
        hasDate: false,
      };

      continue;
    }

    // ------------------------------------------------
    // If current experience already has a date and a
    // new company line is followed by another date,
    // this is a new experience.
    // ------------------------------------------------

    if (
      current &&
      current.hasDate &&
      !isBullet &&
      nextLineHasDate
    ) {
      saveCurrent();

      current = {
        lines: [line],
        hasDate: false,
      };

      continue;
    }

    // ------------------------------------------------
    // If there is no date structure, use role keywords
    // only when we don't already have an experience.
    // ------------------------------------------------

    if (
      !current &&
      !isBullet &&
      roleRegex.test(line)
    ) {
      current = {
        lines: [line],
        hasDate: false,
      };

      continue;
    }

    // ------------------------------------------------
    // Everything else belongs to current experience.
    // ------------------------------------------------

    if (current) {
      current.lines.push(line);
    }
  }

  saveCurrent();

  return experience;
};
// =====================================================
// 11. CERTIFICATIONS
// =====================================================

const extractCertifications = (sectionLines) => {
  const certifications = [];

  const lines = sectionLines
    .map(normalizeLine)
    .filter(Boolean);

  if (!lines.length) {
    return certifications;
  }

  for (const line of lines) {
    if (line.length < 3) {
      continue;
    }

    // Never treat another section heading as certification content
    const detected = detectSection(line);

    if (
      detected &&
      detected !== "certifications"
    ) {
      continue;
    }

    // Ignore separators
    if (/^[|,:-]+$/.test(line)) {
      continue;
    }

    /*
     * Keep the COMPLETE certification line.
     *
     * Example:
     * Java Full Stack - July 2024 - 2025
     *
     * Nothing is hardcoded here.
     */
    if (
      !certifications.some(
        (item) =>
          item.toLowerCase() === line.toLowerCase()
      )
    ) {
      certifications.push(line);
    }
  }

  return certifications;
};

const extractAchievements = (sectionLines) => {
  const achievements = [];
  const lines = sectionLines.map(normalizeLine).filter(Boolean);

  for (const line of lines) {
    if (line.length < 3) continue;
    const detected = detectSection(line);
    if (detected && detected !== "achievements") continue;
    if (/^[|,:-]+$/.test(line)) continue;
    if (!achievements.some((item) => item.toLowerCase() === line.toLowerCase())) {
      achievements.push(line);
    }
  }

  return achievements;
};

// =====================================================
// 12. SOCIAL LINKS
// =====================================================

const extractSocialLinks = (text) => {
  const socialLinks = [];

  const urlRegex =
    /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s<>()\[\]]*)?/g;

  const matches = text.match(urlRegex) || [];

  for (let url of matches) {
    url = url
      .replace(/[),.;:]+$/, "")
      .trim();

    const lower = url.toLowerCase();

    const isSocial =
      lower.includes("github.com") ||
      lower.includes("linkedin.com") ||
      lower.includes("gitlab.com") ||
      lower.includes("leetcode.com") ||
      lower.includes("hackerrank.com") ||
      lower.includes("codeforces.com") ||
      lower.includes("portfolio");

    if (!isSocial) continue;

    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    if (!socialLinks.includes(url)) {
      socialLinks.push(url);
    }
  }

  return socialLinks;
};

// =====================================================
// 13. MAIN RESUME PARSER
// =====================================================

const parseResume = async (filePath) => {
  const rawText = await extractRawText(filePath);

  if (!rawText || !rawText.trim()) {
    throw new Error(
      "Could not extract text from the resume."
    );
  }

  const text = cleanText(rawText);

  const sections = getSections(text);
  const result = {
    text,

    skills: extractSkills(text),

    education: extractEducation(
      sections.education
    ),

    projects: extractProjects(
      sections.projects
    ),

    experience: extractExperience(
      sections.experience
    ),

    certifications: extractCertifications(
      sections.certifications
    ),

    achievements: extractAchievements(sections.achievements),

    socialLinks: extractSocialLinks(text),
  };

  return result;
};

module.exports = {
  extractResumeText: extractRawText,
  parseResume,
};
