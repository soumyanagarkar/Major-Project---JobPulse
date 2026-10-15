const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch(e){}
const mongoose = require('mongoose');
require('dotenv').config();
const Job = require('./models/Job');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const sources = await Job.aggregate([ { $group: { _id: '$source', count: { $sum: 1 } } } ]);
  console.log('SOURCES:', JSON.stringify(sources));

  const jtypes = await Job.aggregate([ { $group: { _id: '$jobType', count: { $sum: 1 } } } ]);
  console.log('JOBTYPES:', JSON.stringify(jtypes));

  const wmodes = await Job.aggregate([ { $group: { _id: '$workMode', count: { $sum: 1 } } } ]);
  console.log('WORKMODES:', JSON.stringify(wmodes));

  const pythonCount = await Job.countDocuments({ $or: [{ title: /python/i }, { description: /python/i }, { skills: /python/i }] });
  console.log('PYTHON JOBS IN DB:', pythonCount);

  const reactCount = await Job.countDocuments({ $or: [{ title: /react/i }, { description: /react/i }, { skills: /react/i }] });
  console.log('REACT JOBS IN DB:', reactCount);

  const internCount = await Job.countDocuments({ $or: [{ title: /intern/i }, { jobType: /intern/i }] });
  console.log('INTERN JOBS IN DB:', internCount);

  const remoteCount = await Job.countDocuments({ $or: [{ workMode: /remote/i }, { isRemote: true }] });
  console.log('REMOTE JOBS IN DB:', remoteCount);

  await mongoose.disconnect();
}
run();
