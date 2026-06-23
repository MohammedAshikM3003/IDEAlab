import dotenv from 'dotenv';
import mongoose from 'mongoose';
import EmailLog from '../models/EmailLog.js';

dotenv.config({ path: '../.env' });

async function checkEmailLogs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const logs = await EmailLog.find().sort({ receivedAt: -1 }).limit(3);
    console.log(JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

checkEmailLogs();
