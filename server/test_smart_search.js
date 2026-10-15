const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch(e){}
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const Job = require('./models/Job');

function buildQuery({ searchTerm = '', location = '', jobType = '', workMode = '', source = '', hoursOld = '' }) {
  const query = {};

  // Source filter
  if (source && source.trim()) {
    query.source = { $regex: new RegExp(`^${source.trim()}$`, 'i') };
  }

  // Job Type filter
  if (jobType && jobType.trim()) {
    const jt = jobType.trim().toLowerCase();
    if (jt.includes('intern')) {
      query.jobType = { $regex: /intern/i };
    } else if (jt.includes('full')) {
      query.jobType = { $regex: /full/i };
    } else if (jt.includes('part')) {
      query.jobType = { $regex: /part/i };
    } else if (jt.includes('contract')) {
      query.jobType = { $regex: /contract/i };
    } else {
      query.jobType = { $regex: new RegExp(jobType.trim(), 'i') };
    }
  }

  // Work Mode filter
  if (workMode && workMode.trim()) {
    const wm = workMode.trim().toLowerCase();
    if (wm.includes('remote')) {
      query.$or = [{ workMode: /remote/i }, { isRemote: true }];
    } else if (wm.includes('hybrid')) {
      query.workMode = /hybrid/i;
    } else if (wm.includes('site') || wm.includes('onsite') || wm.includes('on-site')) {
      query.workMode = /onsite|on-site|office/i;
    }
  }

  // Location filter
  if (location && location.trim()) {
    const locRegex = { location: { $regex: location.trim(), $options: 'i' } };
    if (query.$or) {
      query.$and = [{ $or: query.$or }, { $or: [locRegex, { isRemote: true }] }];
      delete query.$or;
    } else {
      query.$or = [locRegex, { isRemote: true }];
    }
  }

  // Date filter
  if (hoursOld && !isNaN(Number(hoursOld))) {
    const cutoff = new Date(Date.now() - Number(hoursOld) * 3600 * 1000);
    query.$or = (query.$or || []).concat([
      { postedDate: { $gte: cutoff } },
      { scrapedAt: { $gte: cutoff } }
    ]);
  }

  // Search term
  if (searchTerm && searchTerm.trim()) {
    const term = searchTerm.trim();
    const tokens = term.split(/\s+/).filter(t => t.length >= 2);
    const searchConditions = [
      { title: { $regex: term, $options: 'i' } },
      { skills: { $in: [new RegExp(term, 'i')] } },
      { company: { $regex: term, $options: 'i' } },
      { description: { $regex: term, $options: 'i' } }
    ];
    if (tokens.length > 1) {
      tokens.forEach(tok => {
        searchConditions.push({ title: { $regex: tok, $options: 'i' } });
      });
    }

    if (query.$and) {
      query.$and.push({ $or: searchConditions });
    } else if (query.$or) {
      query.$and = [{ $or: query.$or }, { $or: searchConditions }];
      delete query.$or;
    } else {
      query.$or = searchConditions;
    }
  }

  return query;
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB.');

  const testCases = [
    { label: 'Search "react"', params: { searchTerm: 'react' } },
    { label: 'Search "python"', params: { searchTerm: 'python' } },
    { label: 'Search "data analyst"', params: { searchTerm: 'data analyst' } },
    { label: 'Search "developer"', params: { searchTerm: 'developer' } },
    { label: 'Filter jobType="internship"', params: { jobType: 'internship' } },
    { label: 'Filter jobType="fulltime"', params: { jobType: 'fulltime' } },
    { label: 'Filter workMode="Remote"', params: { workMode: 'Remote' } },
    { label: 'Filter workMode="Hybrid"', params: { workMode: 'Hybrid' } },
    { label: 'Filter workMode="On-site"', params: { workMode: 'On-site' } },
    { label: 'Filter source="LinkedIn"', params: { source: 'LinkedIn' } },
    { label: 'Filter source="Greenhouse"', params: { source: 'Greenhouse' } },
    { label: 'Combined "react" + Remote', params: { searchTerm: 'react', workMode: 'Remote' } },
    { label: 'Combined "python" + Internship', params: { searchTerm: 'python', jobType: 'internship' } },
  ];

  for (const tc of testCases) {
    const t0 = Date.now();
    const q = buildQuery(tc.params);
    const jobs = await Job.find(q).sort({ scrapedAt: -1 }).limit(50).lean();
    console.log(`[${tc.label}] => ${jobs.length} jobs in ${Date.now() - t0}ms`);
    if (jobs.length > 0) {
      console.log(`   Sample: "${jobs[0].title}" at ${jobs[0].company} (type: ${jobs[0].jobType}, mode: ${jobs[0].workMode}, src: ${jobs[0].source})`);
    } else {
      console.log('   ⚠️ ZERO JOBS!');
    }
  }

  await mongoose.disconnect();
}

run();
