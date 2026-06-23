import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config({ path: '../.env' });

async function checkGmail() {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      access_token: process.env.GOOGLE_ACCESS_TOKEN,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    console.log('Fetching recent emails...');
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 5,
    });

    const messages = res.data.messages || [];
    for (const msg of messages) {
      const fullRes = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full',
      });
      const fullMessage = fullRes.data;
      
      const subject = fullMessage.payload.headers.find(h => h.name.toLowerCase() === 'subject')?.value;
      const from = fullMessage.payload.headers.find(h => h.name.toLowerCase() === 'from')?.value;
      const date = fullMessage.payload.headers.find(h => h.name.toLowerCase() === 'date')?.value;
      
      console.log(`--- Message ID: ${msg.id} ---`);
      console.log(`Date: ${date}`);
      console.log(`From: ${from}`);
      console.log(`Subject: ${subject}`);
      console.log(`Labels: ${fullMessage.labelIds?.join(', ')}`);
    }

  } catch (err) {
    console.error(err);
  }
}

checkGmail();
