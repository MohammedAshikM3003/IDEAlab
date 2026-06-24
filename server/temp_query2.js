import mongoose from 'mongoose';
mongoose.connect('mongodb+srv://admin:Password%40123@ksridealab.fpfklnn.mongodb.net/idealab?retryWrites=true&w=majority&appName=KSRidealab')
  .then(async () => {
    const db = mongoose.connection.db;
    const booking = await db.collection('bookingrequests').findOne({_id: new mongoose.Types.ObjectId("6a3a4274812349ba74eac404")});
    console.log("type of venue:", typeof booking.confirmedBooking.venue);
    console.log("is ObjectId?", booking.confirmedBooking.venue instanceof mongoose.Types.ObjectId);
    process.exit(0);
  });
