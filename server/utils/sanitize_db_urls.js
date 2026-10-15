const dns = require("dns");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const Job = require("../models/Job");

/*
 *   node utils/sanitize_db_urls.js           -> dry run (just counts)
 *   node utils/sanitize_db_urls.js --apply   -> delete the fake records
 */

const FAKE_URL_FILTER = {
  $or: [
    { jobUrl: /jobpulse_id=/i },
    { jobUrl: /linkedin\.com\/jobs\/search/i },
    { jobUrl: /example\.com|placeholder/i },
    { jobUrl: /careers\/.*-2026/i },
    {
      jobUrl:
        /(nexlify\.io|cloudvibe\.dev|innowave\.ai|pixelcraft\.io|datascale\.net|zenocorp\.com|cognitiveai\.org|deeppulse\.ai|testvanguard|appspark|designhatch|cloudnative\.dev|hyperscale\.ai|krutrim\.com\/careers)/i,
    },
    { jobUrl: { $in: ["", "#"] } },
  ],
};

async function run() {
  const apply = process.argv.includes("--apply");
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const count = await Job.countDocuments(FAKE_URL_FILTER);
    console.log(`Records with manufactured / non-posting links: ${count}`);

    if (!apply) {
      console.log("Dry run only. Re-run with --apply to delete them.");
      return;
    }

    const result = await Job.deleteMany(FAKE_URL_FILTER);
    console.log(`Deleted ${result.deletedCount} records.`);
  } catch (error) {
    console.error("Cleanup error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

run();