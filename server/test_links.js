const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch(e){}
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const Job = require('./models/Job');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const sample = await Job.find({}, { title: 1, company: 1, jobUrl: 1, applicationUrl: 1, source: 1 }).limit(30).lean();
  console.log('30 Sample Job URLs:');
  sample.forEach(j => console.log(`[${j.source}] ${j.company} - ${j.title} => ${j.jobUrl || j.applicationUrl}`));

  const dummyCount = await Job.countDocuments({
    $or: [
      { jobUrl: /2026/ },
      { jobUrl: /example\.com/ },
      { jobUrl: /dummy/ },
      { jobUrl: /test/ },
      { jobUrl: /localhost/ },
    ]
  });
  console.log('\nDummy/Synthetic URL count:', dummyCount);

  // Check jobs with valid https URL
  const validHttps = await Job.countDocuments({ jobUrl: /^https?:\/\//i });
  console.log('Valid HTTP(S) URL count:', validHttps, 'out of', await Job.countDocuments());

  // Check how many have applicationUrl vs jobUrl
  const hasAppUrl = await Job.countDocuments({ applicationUrl: /^https?:\/\//i });
  console.log('Has applicationUrl:', hasAppUrl);

  await mongoose.disconnect();
}

test();
