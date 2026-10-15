const dns = require("dns");
const mongoose = require("mongoose");
const path = require("path");
const axios = require("axios");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const Job = require("../models/Job");

const PYTHON_API = process.env.PYTHON_API || "http://127.0.0.1:8000";

// Re-classification helper matching our Python engine
const classifyJob = (job) => {
  const title = (job.title || "").trim().toLowerCase();
  const description = (job.description || "").trim().toLowerCase();
  const rawType = (job.jobType || "").trim().toLowerCase();

  const isInternTitle = /\b(intern(ship|s)?|co[- ]?op|trainee|apprentice)\b/i.test(title);
  const isNonInternTitle = /\b(senior|lead|principal|director|vp|head|chief|architect|manager|consultant|analyst|specialist|officer|administrator|engineer|developer|scientist|executive|representative)\b/i.test(title);

  let newJobType = "Full-Time";
  if (isInternTitle) {
    newJobType = "Internship";
  } else if (isNonInternTitle) {
    if (rawType.includes("contract")) newJobType = "Contract";
    else if (rawType.includes("part") && rawType.includes("time")) newJobType = "Part-Time";
    else newJobType = "Full-Time";
  } else if (rawType.includes("intern")) {
    newJobType = "Internship";
  } else if (rawType.includes("part") && rawType.includes("time")) {
    newJobType = "Part-Time";
  } else if (rawType.includes("contract")) {
    newJobType = "Contract";
  }

  // Work mode
  let newWorkMode = job.workMode || (job.isRemote ? "Remote" : "Onsite");
  if (/\b(work location\s*:\s*in person|in person|on[\s-]?site|office based)\b/i.test(description)) {
    newWorkMode = "Onsite";
  } else if (/\bhybrid\b/i.test(title) || /\bhybrid\b/i.test(description)) {
    newWorkMode = "Hybrid";
  } else if (/\bremote\b/i.test(title) || /\b100% remote\b/i.test(description) || job.isRemote) {
    newWorkMode = "Remote";
  }

  return {
    jobType: newJobType,
    workMode: newWorkMode,
    isRemote: newWorkMode === "Remote",
  };
};

const NOW = Date.now();
const daysAgo = (days) => new Date(NOW - days * 24 * 3600 * 1000).toISOString();

const CURATED_JOBS = [
  // ==================== FULL STACK & WEB DEVELOPMENT ====================
  {
    title: "Full Stack Developer",
    company: "Razorpay",
    companyUrl: "https://razorpay.com",
    location: "Bengaluru, India",
    workMode: "Hybrid",
    isRemote: false,
    jobType: "Full-Time",
    skills: ["React", "Node.js", "Express", "MongoDB", "TypeScript", "Redis", "AWS"],
    experience: "1 - 3 years",
    description: "Razorpay is looking for a passionate Full Stack Developer to build high-scale merchant banking interfaces and robust payment orchestration systems. Hands-on experience with Node.js, React, and distributed cloud services required.",
    source: "LinkedIn",
    jobUrl: "https://razorpay.com/careers/fullstack-dev-blr-2026",
    postedDate: daysAgo(1),
    minSalary: 1400000,
    maxSalary: 2200000,
    salary: "₹14,00,000 - ₹22,00,000 / year",
    salaryCurrency: "INR",
  },
  {
    title: "Full Stack Engineer Intern",
    company: "Nexlify Tech",
    companyUrl: "https://nexlify.io",
    location: "Remote",
    workMode: "Remote",
    isRemote: true,
    jobType: "Internship",
    skills: ["React", "Node.js", "Express", "MongoDB", "JavaScript"],
    experience: "Fresher / Student",
    description: "Nexlify is seeking an enthusiastic Full Stack Engineer Intern to build dynamic web applications. You will collaborate on building RESTful APIs using Node.js and Express, architect MongoDB schemas, and craft intuitive interfaces with React. Open to freshers and college students.",
    source: "LinkedIn",
    jobUrl: "https://nexlify.io/careers/fullstack-intern-2026",
    postedDate: daysAgo(2),
    minSalary: 25000,
    maxSalary: 45000,
    salary: "₹25,000 - ₹45,000 / month",
    salaryCurrency: "INR",
  },
  {
    title: "Software Engineer Intern - Full Stack",
    company: "CloudVibe Solutions",
    companyUrl: "https://cloudvibe.dev",
    location: "Mumbai, India",
    workMode: "Remote",
    isRemote: true,
    jobType: "Internship",
    skills: ["React", "Node", "Express", "MongoDB", "TypeScript", "Git"],
    experience: "Fresher",
    description: "CloudVibe is hiring a Software Engineer Intern (Full Stack) to work remotely from Mumbai or anywhere in India. You will build user-facing features in React, integrate backend services with Node/Express, and work with MongoDB Atlas. Perfect for freshers.",
    source: "Indeed",
    jobUrl: "https://cloudvibe.dev/jobs/swe-intern-fullstack",
    postedDate: daysAgo(3),
    minSalary: 30000,
    maxSalary: 50000,
    salary: "₹30,000 - ₹50,000 / month",
    salaryCurrency: "INR",
  },
  {
    title: "MERN Stack Developer",
    company: "Zomato",
    companyUrl: "https://zomato.com",
    location: "Gurgaon, India",
    workMode: "Hybrid",
    isRemote: false,
    jobType: "Full-Time",
    skills: ["MongoDB", "Express", "React", "Node.js", "Next.js", "Redux"],
    experience: "2 - 4 years",
    description: "Join Zomato's restaurant partner experience team. Build real-time order tracking dashboards and menu management tools using the MERN stack with Next.js and high-performance websockets.",
    source: "LinkedIn",
    jobUrl: "https://zomato.com/careers/mern-stack-dev-gurgaon",
    postedDate: daysAgo(2),
    minSalary: 1600000,
    maxSalary: 2600000,
    salary: "₹16,00,000 - ₹26,00,000 / year",
    salaryCurrency: "INR",
  },
  {
    title: "Web Development Intern (MERN Stack)",
    company: "InnoWave Labs",
    companyUrl: "https://innowave.ai",
    location: "Remote",
    workMode: "Remote",
    isRemote: true,
    jobType: "Internship",
    skills: ["MongoDB", "Express", "React", "Node.js", "REST APIs"],
    experience: "0 - 1 years",
    description: "Join InnoWave Labs as a MERN Stack Web Development Intern. You will contribute to our core customer dashboard using React and Tailwind, develop scalable microservices in Node.js/Express, and optimize MongoDB queries. Fully remote.",
    source: "LinkedIn",
    jobUrl: "https://innowave.ai/careers/mern-intern-2026",
    postedDate: daysAgo(1),
    minSalary: 20000,
    maxSalary: 40000,
    salary: "₹20,000 - ₹40,000 / month",
    salaryCurrency: "INR",
  },
  {
    title: "Senior Full Stack Engineer",
    company: "Swiggy",
    companyUrl: "https://swiggy.com",
    location: "Bengaluru, India",
    workMode: "Hybrid",
    isRemote: false,
    jobType: "Full-Time",
    skills: ["Node.js", "React", "TypeScript", "Kafka", "PostgreSQL", "Docker", "AWS"],
    experience: "4 - 7 years",
    description: "Swiggy is hiring a Senior Full Stack Engineer for our Instamart platform. Architect high-throughput inventory engines, lead microservices modernization, and deliver sub-second grocery delivery experiences.",
    source: "LinkedIn",
    jobUrl: "https://swiggy.com/careers/sr-fullstack-instamart",
    postedDate: daysAgo(4),
    minSalary: 2800000,
    maxSalary: 4200000,
    salary: "₹28,00,000 - ₹42,00,000 / year",
    salaryCurrency: "INR",
  },

  // ==================== FRONTEND DEVELOPMENT ====================
  {
    title: "Frontend Engineer",
    company: "Flipkart",
    companyUrl: "https://flipkart.com",
    location: "Bengaluru, India",
    workMode: "Onsite",
    isRemote: false,
    jobType: "Full-Time",
    skills: ["React", "TypeScript", "Redux", "Tailwind CSS", "Webpack", "Performance Optimization"],
    experience: "2 - 5 years",
    description: "Flipkart is seeking a Frontend Engineer to craft lightning-fast e-commerce shopping experiences. Deep expertise in React hooks, web vitals optimization, accessible UI components, and TypeScript required.",
    source: "LinkedIn",
    jobUrl: "https://flipkart.com/careers/frontend-engineer-blr",
    postedDate: daysAgo(1),
    minSalary: 1800000,
    maxSalary: 2800000,
    salary: "₹18,00,000 - ₹28,00,000 / year",
    salaryCurrency: "INR",
  },
  {
    title: "Frontend Developer Intern",
    company: "PixelCraft Studios",
    companyUrl: "https://pixelcraft.io",
    location: "Mumbai, India",
    workMode: "Hybrid",
    isRemote: false,
    jobType: "Internship",
    skills: ["React", "JavaScript", "HTML", "CSS", "Redux"],
    experience: "Fresher",
    description: "PixelCraft is seeking a Frontend Developer Intern based in Mumbai for a hybrid role. Work on responsive web designs, state management with Redux, and modern React components.",
    source: "Indeed",
    jobUrl: "https://pixelcraft.io/jobs/frontend-intern-mumbai",
    postedDate: daysAgo(4),
    minSalary: 20000,
    maxSalary: 35000,
    salary: "₹20,000 - ₹35,000 / month",
    salaryCurrency: "INR",
  },
  {
    title: "React Developer",
    company: "PhonePe",
    companyUrl: "https://phonepe.com",
    location: "Bengaluru, India",
    workMode: "Hybrid",
    isRemote: false,
    jobType: "Full-Time",
    skills: ["React", "JavaScript", "TypeScript", "REST APIs", "CSS Modules"],
    experience: "1 - 3 years",
    description: "PhonePe seeks a React Developer for building frictionless digital payments workflows and financial dashboards used by over 500 million Indian users.",
    source: "LinkedIn",
    jobUrl: "https://phonepe.com/careers/react-dev-blr",
    postedDate: daysAgo(3),
    minSalary: 1300000,
    maxSalary: 2000000,
    salary: "₹13,00,000 - ₹20,00,000 / year",
    salaryCurrency: "INR",
  },
  {
    title: "UI/UX & Frontend Intern",
    company: "DesignHatch Labs",
    companyUrl: "https://designhatch.io",
    location: "Remote",
    workMode: "Remote",
    isRemote: true,
    jobType: "Internship",
    skills: ["Figma", "HTML", "CSS", "Tailwind CSS", "React", "JavaScript"],
    experience: "Fresher / Student",
    description: "Turn gorgeous Figma wireframes into pixel-perfect React components. Collaborate closely with our product designers and learn production frontend engineering in a supportive, fully remote team.",
    source: "RemoteOK",
    jobUrl: "https://designhatch.io/interns/ui-frontend",
    postedDate: daysAgo(2),
    minSalary: 22000,
    maxSalary: 38000,
    salary: "₹22,000 - ₹38,000 / month",
    salaryCurrency: "INR",
  },

  // ==================== BACKEND DEVELOPMENT ====================
  {
    title: "Backend Engineer (Node.js / Express)",
    company: "Postman",
    companyUrl: "https://postman.com",
    location: "Bengaluru, India",
    workMode: "Remote",
    isRemote: true,
    jobType: "Full-Time",
    skills: ["Node.js", "Express", "TypeScript", "PostgreSQL", "Redis", "Microservices", "REST APIs"],
    experience: "2 - 5 years",
    description: "Join Postman's API platform engineering team. Build robust backend services, optimize database queries, design scalable REST and gRPC interfaces, and power collaboration for 30 million developers worldwide.",
    source: "LinkedIn",
    jobUrl: "https://postman.com/careers/backend-eng-node",
    postedDate: daysAgo(1),
    minSalary: 2000000,
    maxSalary: 3200000,
    salary: "₹20,00,000 - ₹32,00,000 / year",
    salaryCurrency: "INR",
  },
  {
    title: "Backend Engineer Intern (Node.js)",
    company: "DataScale Systems",
    companyUrl: "https://datascale.net",
    location: "Remote",
    workMode: "Remote",
    isRemote: true,
    jobType: "Internship",
    skills: ["Node.js", "Express", "MongoDB", "Redis", "Docker"],
    experience: "Fresher",
    description: "DataScale Systems is looking for a Backend Engineer Intern with hands-on Node.js, Express, and MongoDB skills. You will design clean REST endpoints, write unit tests, and deploy backend microservices.",
    source: "Remotive",
    jobUrl: "https://datascale.net/jobs/backend-intern-node",
    postedDate: daysAgo(2),
    minSalary: 30000,
    maxSalary: 55000,
    salary: "₹30,000 - ₹55,000 / month",
    salaryCurrency: "INR",
  },
  {
    title: "Python Backend Developer",
    company: "Cred",
    companyUrl: "https://cred.club",
    location: "Bengaluru, India",
    workMode: "Onsite",
    isRemote: false,
    jobType: "Full-Time",
    skills: ["Python", "FastAPI", "Django", "PostgreSQL", "AWS", "Kafka"],
    experience: "2 - 4 years",
    description: "Cred is hiring a Python Backend Developer to design bulletproof fintech microservices. Build high-frequency ledger systems, integrate bank gateways, and architect clean APIs using FastAPI and PostgreSQL.",
    source: "LinkedIn",
    jobUrl: "https://cred.club/careers/python-backend-blr",
    postedDate: daysAgo(3),
    minSalary: 2200000,
    maxSalary: 3500000,
    salary: "₹22,00,000 - ₹35,00,000 / year",
    salaryCurrency: "INR",
  },
  {
    title: "Java Backend Engineer",
    company: "JPMorgan Chase",
    companyUrl: "https://jpmorganchase.com",
    location: "Hyderabad, India",
    workMode: "Hybrid",
    isRemote: false,
    jobType: "Full-Time",
    skills: ["Java", "Spring Boot", "Microservices", "Oracle", "Kafka", "Docker"],
    experience: "3 - 6 years",
    description: "JPMorgan Chase is seeking a Java Backend Engineer in Hyderabad. Develop secure, enterprise banking microservices using Spring Boot, handle mission-critical event streams with Kafka, and optimize relational data models.",
    source: "Indeed",
    jobUrl: "https://jpmorgan.com/careers/java-swe-hyd",
    postedDate: daysAgo(5),
    minSalary: 1800000,
    maxSalary: 2800000,
    salary: "₹18,00,000 - ₹28,00,000 / year",
    salaryCurrency: "INR",
  },
  {
    title: "Software Engineer Intern - Backend",
    company: "HackerRank",
    companyUrl: "https://hackerrank.com",
    location: "Bengaluru, India",
    workMode: "Hybrid",
    isRemote: false,
    jobType: "Internship",
    skills: ["Python", "Node.js", "Data Structures", "Algorithms", "SQL", "Git"],
    experience: "Fresher / College Student",
    description: "HackerRank invites engineering students to join our Backend Engineering Internship. Solve tough algorithmic challenges, build distributed execution sandboxes, and help evaluate millions of developer assessments.",
    source: "LinkedIn",
    jobUrl: "https://hackerrank.com/careers/swe-backend-intern-2026",
    postedDate: daysAgo(2),
    minSalary: 40000,
    maxSalary: 60000,
    salary: "₹40,000 - ₹60,000 / month",
    salaryCurrency: "INR",
  },

  // ==================== AI, MACHINE LEARNING & DATA SCIENCE ====================
  {
    title: "Machine Learning Engineer",
    company: "Ola Krutrim",
    companyUrl: "https://krutrim.com",
    location: "Bengaluru, India",
    workMode: "Onsite",
    isRemote: false,
    jobType: "Full-Time",
    skills: ["Python", "PyTorch", "TensorFlow", "Transformers", "NLP", "LLMs", "Docker"],
    experience: "2 - 5 years",
    description: "Krutrim is India's leading AI organization building foundational multilingual models. We are hiring a Machine Learning Engineer to fine-tune LLMs, build evaluation pipelines, and deploy inference at scale.",
    source: "LinkedIn",
    jobUrl: "https://krutrim.com/careers/ml-engineer-blr",
    postedDate: daysAgo(1),
    minSalary: 2400000,
    maxSalary: 4000000,
    salary: "₹24,00,000 - ₹40,00,000 / year",
    salaryCurrency: "INR",
  },
  {
    title: "AI / Machine Learning Intern",
    company: "HyperScale AI",
    companyUrl: "https://hyperscale.ai",
    location: "Remote",
    workMode: "Remote",
    isRemote: true,
    jobType: "Internship",
    skills: ["Python", "PyTorch", "Scikit-Learn", "NLP", "Pandas", "Hugging Face"],
    experience: "Fresher / Student",
    description: "Excited about Generative AI? Join HyperScale AI as an ML Intern. You will research retrieval-augmented generation (RAG) techniques, build semantic vector search prototypes, and evaluate embedding models.",
    source: "LinkedIn",
    jobUrl: "https://hyperscale.ai/careers/ai-intern-2026",
    postedDate: daysAgo(2),
    minSalary: 35000,
    maxSalary: 60000,
    salary: "₹35,000 - ₹60,000 / month",
    salaryCurrency: "INR",
  },
  {
    title: "Data Scientist",
    company: "Swiggy Analytics",
    companyUrl: "https://swiggy.com",
    location: "Bengaluru, India",
    workMode: "Hybrid",
    isRemote: false,
    jobType: "Full-Time",
    skills: ["Python", "SQL", "Machine Learning", "Statistics", "A/B Testing", "Spark"],
    experience: "2 - 4 years",
    description: "Swiggy is seeking a Data Scientist to formulate predictive delivery dispatch models, customer retention algorithms, and pricing elasticity curves using machine learning and causal inference.",
    source: "Indeed",
    jobUrl: "https://swiggy.com/careers/data-scientist-blr",
    postedDate: daysAgo(3),
    minSalary: 1900000,
    maxSalary: 3000000,
    salary: "₹19,00,000 - ₹30,00,000 / year",
    salaryCurrency: "INR",
  },
  {
    title: "Data Analyst Intern",
    company: "Urban Company",
    companyUrl: "https://urbancompany.com",
    location: "Gurgaon, India",
    workMode: "Hybrid",
    isRemote: false,
    jobType: "Internship",
    skills: ["SQL", "Python", "Excel", "Tableau", "Power BI", "Data Analysis"],
    experience: "Fresher",
    description: "Urban Company is looking for a Data Analyst Intern. Work alongside product and operations leadership to build automated dashboards, analyze partner quality metrics, and extract actionable business insights from big data.",
    source: "LinkedIn",
    jobUrl: "https://urbancompany.com/careers/data-analyst-intern-gurgaon",
    postedDate: daysAgo(4),
    minSalary: 25000,
    maxSalary: 40000,
    salary: "₹25,000 - ₹40,000 / month",
    salaryCurrency: "INR",
  },

  // ==================== CLOUD, DEVOPS & INFRASTRUCTURE ====================
  {
    title: "DevOps Engineer",
    company: "Groww",
    companyUrl: "https://groww.in",
    location: "Bengaluru, India",
    workMode: "Hybrid",
    isRemote: false,
    jobType: "Full-Time",
    skills: ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "Linux", "Prometheus"],
    experience: "2 - 5 years",
    description: "Groww is looking for a DevOps Engineer to manage high-availability financial trading infrastructure. Automate zero-downtime Kubernetes deployments, manage multi-region AWS environments, and configure monitoring alerts.",
    source: "LinkedIn",
    jobUrl: "https://groww.in/careers/devops-eng-blr",
    postedDate: daysAgo(2),
    minSalary: 1800000,
    maxSalary: 3000000,
    salary: "₹18,00,000 - ₹30,00,000 / year",
    salaryCurrency: "INR",
  },
  {
    title: "Cloud & DevOps Intern",
    company: "CloudNative Labs",
    companyUrl: "https://cloudnative.dev",
    location: "Remote",
    workMode: "Remote",
    isRemote: true,
    jobType: "Internship",
    skills: ["Linux", "Docker", "Git", "Bash", "AWS", "GitHub Actions"],
    experience: "Fresher / Student",
    description: "Gain hands-on experience building automated CI/CD pipelines, containerizing web services with Docker, and provisioning cloud infrastructure on AWS. Mentorship provided by veteran SREs.",
    source: "RemoteOK",
    jobUrl: "https://cloudnative.dev/interns/devops-2026",
    postedDate: daysAgo(3),
    minSalary: 25000,
    maxSalary: 45000,
    salary: "₹25,000 - ₹45,000 / month",
    salaryCurrency: "INR",
  },
  {
    title: "Site Reliability Engineer (SRE)",
    company: "Zerodha",
    companyUrl: "https://zerodha.com",
    location: "Bengaluru, India",
    workMode: "Onsite",
    isRemote: false,
    jobType: "Full-Time",
    skills: ["Linux", "Python", "Go", "PostgreSQL", "HAProxy", "Kafka", "Networking"],
    experience: "3 - 6 years",
    description: "Zerodha powers over 15% of all Indian retail trading volume. Join our small, high-leverage infrastructure team building fast, resilient, self-hosted financial backends without bloat.",
    source: "LinkedIn",
    jobUrl: "https://zerodha.com/careers/sre-blr",
    postedDate: daysAgo(4),
    minSalary: 2500000,
    maxSalary: 4500000,
    salary: "₹25,00,000 - ₹45,00,000 / year",
    salaryCurrency: "INR",
  },

  // ==================== MOBILE DEVELOPMENT ====================
  {
    title: "React Native Developer",
    company: "Zepto",
    companyUrl: "https://zepto.com",
    location: "Mumbai, India",
    workMode: "Hybrid",
    isRemote: false,
    jobType: "Full-Time",
    skills: ["React Native", "TypeScript", "Redux", "iOS", "Android", "Mobile UI"],
    experience: "2 - 4 years",
    description: "Zepto is hiring a React Native Developer to build blazing-fast mobile experiences for millions of consumers ordering quick-commerce groceries every single day.",
    source: "LinkedIn",
    jobUrl: "https://zepto.com/careers/react-native-mumbai",
    postedDate: daysAgo(2),
    minSalary: 1600000,
    maxSalary: 2600000,
    salary: "₹16,00,000 - ₹26,00,000 / year",
    salaryCurrency: "INR",
  },
  {
    title: "Flutter Developer Intern",
    company: "AppSpark Innovations",
    companyUrl: "https://appspark.io",
    location: "Hyderabad, India",
    workMode: "Remote",
    isRemote: true,
    jobType: "Internship",
    skills: ["Flutter", "Dart", "Firebase", "REST APIs", "Mobile Design"],
    experience: "Fresher / Student",
    description: "AppSpark is looking for a creative Flutter Developer Intern to develop cross-platform mobile apps for iOS and Android. Build fluid animations, integrate Firebase backends, and learn clean architecture.",
    source: "Indeed",
    jobUrl: "https://appspark.io/careers/flutter-intern-hyd",
    postedDate: daysAgo(3),
    minSalary: 20000,
    maxSalary: 35000,
    salary: "₹20,000 - ₹35,000 / month",
    salaryCurrency: "INR",
  },
  {
    title: "Android Developer",
    company: "Paytm",
    companyUrl: "https://paytm.com",
    location: "Noida, India",
    workMode: "Hybrid",
    isRemote: false,
    jobType: "Full-Time",
    skills: ["Kotlin", "Android SDK", "Jetpack Compose", "Coroutines", "MVVM", "Room"],
    experience: "2 - 5 years",
    description: "Paytm is looking for an Android Developer to innovate on QR payments, Soundbox companion apps, and merchant services. Strong Kotlin and Jetpack Compose skills required.",
    source: "LinkedIn",
    jobUrl: "https://paytm.com/careers/android-dev-noida",
    postedDate: daysAgo(5),
    minSalary: 1500000,
    maxSalary: 2400000,
    salary: "₹15,00,000 - ₹24,00,000 / year",
    salaryCurrency: "INR",
  },

  // ==================== CYBERSECURITY & QA ====================
  {
    title: "Cybersecurity Analyst",
    company: "Wipro CyberSec",
    companyUrl: "https://wipro.com",
    location: "Pune, India",
    workMode: "Hybrid",
    isRemote: false,
    jobType: "Full-Time",
    skills: ["SIEM", "Incident Response", "Network Security", "Wireshark", "Vulnerability Assessment"],
    experience: "1 - 3 years",
    description: "Monitor security operations centers (SOC), investigate threat alerts, conduct vulnerability scans, and safeguard client cloud environments against intrusion.",
    source: "Indeed",
    jobUrl: "https://wipro.com/careers/cyber-analyst-pune",
    postedDate: daysAgo(3),
    minSalary: 800000,
    maxSalary: 1400000,
    salary: "₹8,00,000 - ₹14,00,000 / year",
    salaryCurrency: "INR",
  },
  {
    title: "QA Automation Engineer",
    company: "Freshworks",
    companyUrl: "https://freshworks.com",
    location: "Chennai, India",
    workMode: "Hybrid",
    isRemote: false,
    jobType: "Full-Time",
    skills: ["Selenium", "Cypress", "JavaScript", "Java", "TestNG", "CI/CD", "API Testing"],
    experience: "2 - 4 years",
    description: "Freshworks is hiring a QA Automation Engineer to ensure zero-defect software quality. Build end-to-end automated testing suites with Cypress, test microservices APIs with Postman/RestAssured, and integrate tests into CI/CD pipelines.",
    source: "LinkedIn",
    jobUrl: "https://freshworks.com/careers/qa-automation-chennai",
    postedDate: daysAgo(2),
    minSalary: 1200000,
    maxSalary: 1900000,
    salary: "₹12,00,000 - ₹19,00,000 / year",
    salaryCurrency: "INR",
  },
  {
    title: "Software Quality Assurance Intern",
    company: "TestVanguard",
    companyUrl: "https://testvanguard.io",
    location: "Remote",
    workMode: "Remote",
    isRemote: true,
    jobType: "Internship",
    skills: ["Manual Testing", "Test Cases", "Bug Tracking", "Jira", "Postman", "JavaScript"],
    experience: "Fresher",
    description: "Learn professional software testing and QA automation. Write detailed test scenarios, report bugs with clear reproduction steps, and run regression test passes for high-traffic SaaS applications.",
    source: "Indeed",
    jobUrl: "https://testvanguard.io/jobs/qa-intern-2026",
    postedDate: daysAgo(4),
    minSalary: 1800000 / 100,
    maxSalary: 30000,
    salary: "₹18,000 - ₹30,000 / month",
    salaryCurrency: "INR",
  },
];

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully.\n");

    // 1. Fetch live jobs from Python service (/refresh)
    console.log("🌐 Ingesting live jobs from Python service (/refresh)...");
    let liveJobsCount = 0;
    try {
      const response = await axios.post(
        `${PYTHON_API}/refresh`,
        {
          search_term: "",
          location: "",
          job_type: "",
          work_mode: "",
          results_wanted: 200,
        },
        { timeout: 60000 }
      );

      const jobs = Array.isArray(response.data?.jobs) ? response.data.jobs : [];
      console.log(`Retrieved ${jobs.length} live jobs from external sources!`);

      for (const job of jobs) {
        const uniqueUrl = job.jobUrlDirect || job.jobUrl || job.applicationUrl;
        if (!uniqueUrl || !job.title) continue;

        const { jobType, workMode, isRemote } = classifyJob(job);

        await Job.findOneAndUpdate(
          { jobUrl: uniqueUrl },
          {
            $set: {
              ...job,
              jobUrl: uniqueUrl,
              jobType: jobType || job.jobType,
              workMode: workMode || job.workMode,
              isRemote: isRemote,
              matchedSkills: [],
              missingSkills: [],
              matchReasons: [],
              matchScore: undefined,
              finalRankingScore: undefined,
              searchMatchPercentage: undefined,
              roleMatchPercentage: undefined,
              skillMatchPercentage: undefined,
              experienceMatchPercentage: undefined,
              otherFitPercentage: undefined,
              profileMatchPercentage: undefined,
              scrapedAt: new Date().toISOString(),
              postedDate: job.postedDate || new Date().toISOString(),
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        liveJobsCount++;
      }
      console.log(`✅ Upserted ${liveJobsCount} live jobs into MongoDB!\n`);
    } catch (apiErr) {
      console.warn("⚠️ Python /refresh ingestion warning:", apiErr.message);
      console.log("Continuing with curated high-demand opportunities...\n");
    }

    // 2. Seed curated diverse opportunities
    // Curated jobs carry invented URLs that do not point to a real posting,
    // so they are NOT inserted. Only real scraped links are stored.
    console.log("Skipping curated placeholder jobs (their links are not real postings).");
    let curatedCount = 0;

    for (const raw of []) {
      const { jobType, workMode, isRemote } = classifyJob(raw);

      await Job.findOneAndUpdate(
        { jobUrl: raw.jobUrl },
        {
          $set: {
            ...raw,
            jobType,
            workMode,
            isRemote,
            matchedSkills: [],
            missingSkills: [],
            matchReasons: [],
            matchScore: undefined,
            finalRankingScore: undefined,
            searchMatchPercentage: undefined,
            roleMatchPercentage: undefined,
            skillMatchPercentage: undefined,
            experienceMatchPercentage: undefined,
            otherFitPercentage: undefined,
            profileMatchPercentage: undefined,
            scrapedAt: new Date().toISOString(),
            postedDate: raw.postedDate || new Date().toISOString(),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      curatedCount++;
    }
    console.log(`✅ Seeded ${curatedCount} curated tech jobs in MongoDB!\n`);

    // 3. Re-classify all existing jobs in MongoDB
    console.log("Re-classifying & updating all jobs in MongoDB...");
    const allJobs = await Job.find({});
    let updatedCount = 0;

    for (const job of allJobs) {
      const { jobType, workMode, isRemote } = classifyJob(job);
      let changed = false;

      if (job.jobType !== jobType) {
        job.jobType = jobType;
        changed = true;
      }
      if (job.workMode !== workMode) {
        job.workMode = workMode;
        changed = true;
      }
      if (job.isRemote !== isRemote) {
        job.isRemote = isRemote;
        changed = true;
      }

      // Refresh older scrapedAt so jobs remain visible
      if (!job.scrapedAt || new Date(job.scrapedAt) < new Date(NOW - 30 * 24 * 3600 * 1000)) {
        job.scrapedAt = new Date().toISOString();
        changed = true;
      }

      if (changed) {
        await job.save();
        updatedCount++;
      }
    }
    console.log(`Updated ${updatedCount} existing jobs in MongoDB.\n`);

    // 4. Verification stats
    const totalCount = await Job.countDocuments();
    const remoteCount = await Job.countDocuments({ workMode: "Remote" });
    const internCount = await Job.countDocuments({ jobType: "Internship" });
    const fullTimeCount = await Job.countDocuments({ jobType: "Full-Time" });

    console.log("========================================");
    console.log("📊 DATABASE SUMMARY");
    console.log("========================================");
    console.log(`Total jobs in MongoDB:      ${totalCount}`);
    console.log(`Remote jobs:                ${remoteCount}`);
    console.log(`Internship positions:       ${internCount}`);
    console.log(`Full-Time positions:        ${fullTimeCount}`);
    console.log("========================================\n");

  } catch (err) {
    console.error("Error during seeding:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
