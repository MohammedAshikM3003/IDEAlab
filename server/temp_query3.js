import mongoose from 'mongoose';
mongoose.connect('mongodb+srv://admin:Password%40123@ksridealab.fpfklnn.mongodb.net/idealab?retryWrites=true&w=majority&appName=KSRidealab')
  .then(async () => {
    const venueId = new mongoose.Types.ObjectId('69d4aab6897f5b007e3ebfbe');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookings = await mongoose.connection.db.collection('bookingrequests').find({
      status: 'approved',
      'confirmedBooking.venue': venueId,
      'confirmedBooking.date': { $gte: today }
    }).toArray();
    console.log(JSON.stringify(bookings, null, 2));

    const bookings2 = await mongoose.connection.db.collection('bookingrequests').find({
      status: 'approved',
      'confirmedBooking.venue': '69d4aab6897f5b007e3ebfbe'
    }).toArray();
    console.log("STRING QUERY:", bookings2.length);

    process.exit(0);
  });
