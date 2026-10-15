const mongoose = require('mongoose');
const Job = require('../server/models/Job');
require('dotenv').config({ path: '../server/.env' });

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    const total = await Job.countDocuments();
    console.log('Total jobs:', total);
    
    const sources = await Job.aggregate([
      { $group: { _id: '$site', count: { $sum: 1 } } }
    ]);
    console.log('Sources:', JSON.stringify(sources, null, 2));

    const sampleUrls = await Job.find({}, { title: 1, company: 1, site: 1, jobUrl: 1, applicationUrl: 1 }).limit(10);
    console.log('Sample URLs:', JSON.stringify(sampleUrls, null, 2));

    // Check synthetic URLs
    const synthetic = await Job.find({
      $or: [
        { jobUrl: { $regex: 'careers/.*-2026', $options: 'i' } },
        { jobUrl: { $regex: 'example.com', $options: 'i' } },
        { jobUrl: { $regex: 'dummy', $options: 'i' } },
        { jobUrl: { $regex: 'test', $options: 'i' } },
        { jobUrl: { $regex: 'placeholder', $options: 'i' } },
        { jobUrl: { $exists: false } },
        { jobUrl: null },
        { jobUrl: '' }
      ]
    }, { title: 1, company: 1, site: 1, jobUrl: 1 }).limit(20);

    console.log('Synthetic/Invalid URL count:', synthetic.length);
    if (synthetic.length > 0) {
      console.log('Sample synthetic jobs:', JSON.stringify(synthetic.slice(0, 5), null, 2));
    }

    // Check distinct domain names of jobUrl
    const allJobs = await Job.find({}, { jobUrl: 1, site: 1 }).lean();
    const domains = {};
    let noUrlCount = 0;
    for (const j of allJobs) {
      if (!j.jobUrl) {
        noUrlCount++;
        continue;
      }
      try {
        const u = new URL(j.jobUrl);
        domains[u.hostname] = (domains[u.hostname] || 0) + 1;
      } catch (e) {
        domains['INVALID_URL'] = (domains['INVALID_URL'] || 0) + 1;
      }
    }
    console.log('URL Hostnames Breakdown:', JSON.stringify(domains, null, 2));
    console.log('Jobs with no URL:', noUrlCount);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
