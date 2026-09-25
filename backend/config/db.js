const dns = require('dns');
const mongoose = require('mongoose');

async function connectDatabase() {
  const { MONGODB_URI } = process.env;
  const dnsServer = process.env.MONGODB_DNS_SERVER;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in the .env file.');
  }

  try {
    dns.setServers(dnsServer ? [dnsServer] : ['8.8.8.8', '1.1.1.1']);
  } catch {}

  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB Atlas connected.');
}

module.exports = connectDatabase;
