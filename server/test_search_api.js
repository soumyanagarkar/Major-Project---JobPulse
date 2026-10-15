const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch(e){}
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config({ path: './.env' });
const User = require('./models/User');

async function testSearch(token, label, params) {
  try {
    const url = 'http://localhost:5000/api/jobs/search';
    const start = Date.now();
    const res = await axios.get(url, {
      params,
      headers: { Authorization: `Bearer ${token}` },
      timeout: 25000
    });
    console.log(`\n[${label}] (${Date.now() - start}ms) => count: ${res.data.count}, jobs: ${res.data.jobs?.length}`);
    if (res.data.jobs && res.data.jobs.length > 0) {
      const top3 = res.data.jobs.slice(0, 3).map(j => `"${j.title}" at "${j.company}" (type: ${j.jobType}, mode: ${j.workMode}, src: ${j.source}, score: ${j.finalRankingScore}, searchScore: ${j.searchMatchPercentage})`).join('\n   ');
      console.log('   Top matches:\n   ' + top3);
    } else {
      console.log('   ⚠️ ZERO RESULTS! Message: ' + (res.data.message || 'none'));
    }
  } catch (err) {
    console.error(`\n[${label}] ERROR:`, err.response ? { status: err.response.status, data: err.response.data } : err.message);
  }
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  let user = await User.findOne({ email: 'test.fullstack@jobpulse.ai' });
  if (!user) {
    user = await User.findOne();
  }
  const token = jwt.sign(
    { id: user._id, userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  console.log(`Using user: ${user.email} (preferredLocation: ${user.preferredLocation}, preferredWorkMode: ${user.preferredWorkMode}, lookingFor: ${user.lookingFor})`);

  // 1. Plain searches
  await testSearch(token, 'Search: "react"', { search_term: 'react' });
  await testSearch(token, 'Search: "python"', { search_term: 'python' });
  await testSearch(token, 'Search: "data analyst"', { search_term: 'data analyst' });
  await testSearch(token, 'Search: "designer"', { search_term: 'designer' });
  await testSearch(token, 'Search: "software"', { search_term: 'software' });

  // 2. Filters alone
  await testSearch(token, 'Filter: job_type="internship"', { job_type: 'internship' });
  await testSearch(token, 'Filter: job_type="fulltime"', { job_type: 'fulltime' });
  await testSearch(token, 'Filter: work_mode="Remote"', { work_mode: 'Remote' });
  await testSearch(token, 'Filter: work_mode="Hybrid"', { work_mode: 'Hybrid' });
  await testSearch(token, 'Filter: work_mode="On-site"', { work_mode: 'On-site' });
  await testSearch(token, 'Filter: sites="linkedin"', { sites: 'linkedin' });
  await testSearch(token, 'Filter: sites="RemoteOK"', { sites: 'RemoteOK' });

  // 3. Search + Filters combined
  await testSearch(token, 'Combined: "react" + Remote', { search_term: 'react', work_mode: 'Remote' });
  await testSearch(token, 'Combined: "python" + Internship', { search_term: 'python', job_type: 'internship' });

  await mongoose.disconnect();
}

run();
