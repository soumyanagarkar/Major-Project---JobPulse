const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch(e){}
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config({ path: './.env' });
const Job = require('./models/Job');
const User = require('./models/User');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: 'aayush@gmail.com' }).lean();
  console.log('User profile:', {
    targetRole: user.targetRole,
    preferredLocation: user.preferredLocation,
    lookingFor: user.lookingFor,
    preferredWorkMode: user.preferredWorkMode,
  });

  // Find 50 jobs with "react" in title or description or skills
  const reactJobs = await Job.find({
    $or: [
      { title: { $regex: 'react', $options: 'i' } },
      { description: { $regex: 'react', $options: 'i' } },
      { skills: { $in: [/react/i] } },
    ]
  }).limit(50).lean();

  console.log(`Found ${reactJobs.length} React jobs in MongoDB.`);

  // Case B: without forcing profile as hard filters (profile used for ranking)
  const t0 = Date.now();
  try {
    const resB = await axios.post('http://127.0.0.1:8000/rank', {
      search_term: 'react',
      location: '',
      job_type: '',
      work_mode: '',
      profile: user,
      jobs: reactJobs,
    }, { timeout: 15000 });
    console.log(`Case B took ${Date.now() - t0}ms => jobs returned:`, resB.data.jobs?.length);
    if (resB.data.jobs?.length > 0) {
      console.log('Top match:', resB.data.jobs[0].title, 'at', resB.data.jobs[0].company, 'score:', resB.data.jobs[0].finalRankingScore);
    }
  } catch (err) {
    console.error('Case B error:', err.message);
  }

  await mongoose.disconnect();
}

test();
