import dotenv from 'dotenv';
import mongoose from 'mongoose';
import BookingRequest from '../models/BookingRequest.js';

dotenv.config({ path: '../.env' });

async function checkBookings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const bookings = await BookingRequest.find().sort({ receivedAt: -1 }).limit(3);
    console.log(JSON.stringify(bookings, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

checkBookings();
