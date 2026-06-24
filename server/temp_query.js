import mongoose from 'mongoose';
mongoose.connect('mongodb+srv://admin:Password%40123@ksridealab.fpfklnn.mongodb.net/idealab?retryWrites=true&w=majority&appName=KSRidealab')
  .then(async () => {
    const db = mongoose.connection.db;
    const bookings = await db.collection('bookingrequests').find({'status': 'approved'}).toArray();
    console.log(JSON.stringify(bookings, null, 2));
    process.exit(0);
  });
