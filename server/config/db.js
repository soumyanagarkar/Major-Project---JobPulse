const dns = require("dns");
const mongoose = require("mongoose");

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error");
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;