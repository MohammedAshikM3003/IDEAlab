import dotenv from 'dotenv';
import mongoose from 'mongoose';
import gmailWebhookService from '../services/gmail/gmailWebhookService.js';

dotenv.config({ path: '../.env' });

async function processMessage() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Processing message 19ef330da498bc4d...');
    const result = await gmailWebhookService.processMessage('19ef330da498bc4d');
    console.log('Result:', result);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

processMessage();
