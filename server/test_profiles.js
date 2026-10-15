const dns = require("dns");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config({ path: "./.env" });

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const User = require("./models/User");

const PROFILES_TO_TEST = [
  {
    name: "Profile 1: Full Stack Developer",
    user: {
      email: "test.fullstack@jobpulse.ai",
      fullName: "Aayush Sharma",
      password: "password123",
      targetRole: "Full Stack Developer",
      lookingFor: "Full-Time",
      preferredLocation: "Bengaluru, India",
      preferredWorkMode: "Hybrid",
      skills: ["React", "Node.js", "Express", "MongoDB", "TypeScript", "REST APIs"],
    },
  },
  {
    name: "Profile 2: AI / Machine Learning Engineer",
    user: {
      email: "test.ml@jobpulse.ai",
      fullName: "Neha Patel",
      password: "password123",
      targetRole: "Machine Learning Engineer",
      lookingFor: "Full-Time",
      preferredLocation: "Remote",
      preferredWorkMode: "Remote",
      skills: ["Python", "PyTorch", "TensorFlow", "Deep Learning", "NLP", "Pandas"],
    },
  },
  {
    name: "Profile 3: DevOps & Cloud Engineer",
    user: {
      email: "test.devops@jobpulse.ai",
      fullName: "Rohan Verma",
      password: "password123",
      targetRole: "DevOps Engineer",
      lookingFor: "Full-Time",
      preferredLocation: "Hyderabad, India",
      preferredWorkMode: "Hybrid",
      skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux"],
    },
  },
  {
    name: "Profile 4: UI/UX & Product Designer",
    user: {
      email: "test.design@jobpulse.ai",
      fullName: "Pooja Reddy",
      password: "password123",
      targetRole: "UI/UX Designer",
      lookingFor: "Full-Time",
      preferredLocation: "Remote",
      preferredWorkMode: "Remote",
      skills: ["Figma", "UI Design", "UX Research", "Wireframing", "Prototyping"],
    },
  },
  {
    name: "Profile 5: Data Analyst / Business Intelligence",
    user: {
      email: "test.dataanalyst@jobpulse.ai",
      fullName: "Vikram Mehta",
      password: "password123",
      targetRole: "Data Analyst",
      lookingFor: "Full-Time",
      preferredLocation: "Mumbai, India",
      preferredWorkMode: "Hybrid",
      skills: ["SQL", "Power BI", "Tableau", "Excel", "Python", "Data Visualization"],
    },
  },
  {
    name: "Profile 6: Cybersecurity Analyst",
    user: {
      email: "test.cybersec@jobpulse.ai",
      fullName: "Ananya Iyer",
      password: "password123",
      targetRole: "Cybersecurity Analyst",
      lookingFor: "Full-Time",
      preferredLocation: "Pune, India",
      preferredWorkMode: "Hybrid",
      skills: ["Network Security", "SIEM", "Incident Response", "Firewalls", "Wireshark"],
    },
  },
  {
    name: "Profile 7: Marketing & Business Manager",
    user: {
      email: "test.marketing@jobpulse.ai",
      fullName: "Karan Malhotra",
      password: "password123",
      targetRole: "Marketing Specialist",
      lookingFor: "Full-Time",
      preferredLocation: "Gurgaon, India",
      preferredWorkMode: "Hybrid",
      skills: ["SEO", "Content Strategy", "Digital Marketing", "Social Media", "Brand Strategy"],
    },
  },
  {
    name: "Profile 8: Student / Fresher Looking for Internship",
    user: {
      email: "test.intern@jobpulse.ai",
      fullName: "Tanvi Gupta",
      password: "password123",
      targetRole: "Software Intern",
      lookingFor: "Internship",
      preferredLocation: "Remote",
      preferredWorkMode: "Remote",
      skills: ["JavaScript", "HTML", "CSS", "Python", "Git", "React"],
    },
  },
];

async function runProfileTests() {
  console.log("===============================================================");
  console.log("🚀 TESTING JOB MATCHING ACROSS 8 DIVERSE PROFILES");
  console.log("===============================================================\n");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.\n");

  const results = [];

  for (const testCase of PROFILES_TO_TEST) {
    const { name, user } = testCase;

    // Upsert test user so getUserProfile retrieves accurate profile
    const dbUser = await User.findOneAndUpdate(
      { email: user.email },
      { $set: user },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const token = jwt.sign(
      { id: dbUser._id, userId: dbUser._id, email: dbUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log(`▶ Testing: ${name}`);
    console.log(`   Target Role: "${user.targetRole}" | Work Mode: "${user.preferredWorkMode}" | Skills: ${user.skills.slice(0, 4).join(", ")}...`);

    const t0 = Date.now();
    try {
      const res = await axios.get("http://localhost:5000/api/jobs/search", {
        params: {
          search_term: "",
          location: "",
          job_type: "",
          work_mode: "",
          hours_old: "",
          sites: "",
          results_wanted: 200,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 45000,
      });

      const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
      const jobsCount = res.data.count || res.data.jobs?.length || 0;
      const topJobs = (res.data.jobs || []).slice(0, 5);

      console.log(`   ✅ Status: ${res.status} | Time: ${elapsed}s | Jobs Returned: ${jobsCount} (>= 20: ${jobsCount >= 20 ? "PASS ✅" : "FAIL ❌"})`);
      if (topJobs.length > 0) {
        console.log("   Top Recommendations (Strictly Aligned):");
        topJobs.forEach((j, i) => {
          console.log(`     ${i + 1}. [${j.finalRankingScore}%] "${j.title}" @ ${j.company} (${j.location}, ${j.workMode})`);
        });
      }
      console.log("");

      results.push({
        name,
        targetRole: user.targetRole,
        count: jobsCount,
        passed20: jobsCount >= 20,
        elapsed: `${elapsed}s`,
        topJob: topJobs[0]?.title || "None",
        topScore: `${topJobs[0]?.finalRankingScore || 0}%`,
      });
    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}`);
      if (err.response) {
        console.error("   Response:", err.response.data);
      }
      results.push({
        name,
        targetRole: user.targetRole,
        count: 0,
        passed20: false,
        error: err.message,
      });
      console.log("");
    }
  }

  // Cleanup test users
  await User.deleteMany({ email: { $regex: "@jobpulse\\.ai$" } });
  await mongoose.disconnect();

  console.log("===============================================================");
  console.log("📊 TEST RESULTS SUMMARY");
  console.log("===============================================================");
  console.table(results);

  const allPassed = results.every((r) => r.passed20);
  console.log(`\nAll Profiles Returned >= 20 Strictly Aligned Jobs: ${allPassed ? "🎉 YES, 100% PASSED!" : "⚠️ SOME FAILED"}`);

  process.exit(allPassed ? 0 : 1);
}

runProfileTests();
