import mongoose from 'mongoose';
mongoose.connect('mongodb+srv://admin:Password%40123@ksridealab.fpfklnn.mongodb.net/idealab?retryWrites=true&w=majority&appName=KSRidealab')
  .then(async () => {
    const db = mongoose.connection.db;
    const collection = db.collection('bookingrequests');
    const bookings = await collection.find({status: 'approved'}).toArray();
    for (const b of bookings) {
      if (b.confirmedBooking && b.confirmedBooking.timeSlot) {
        let {start, end} = b.confirmedBooking.timeSlot;
        let update = false;
        
        // Clean double AM/PM
        if (start && start.match(/ (AM|PM) (AM|PM)/)) {
          start = start.replace(/ (AM|PM) (AM|PM)/, ' $2');
          update = true;
        }
        if (end && end.match(/ (AM|PM) (AM|PM)/)) {
          end = end.replace(/ (AM|PM) (AM|PM)/, ' $2');
          update = true;
        }
        
        // Clean missing minutes like "04: PM"
        if (start && start.match(/\d{1,2}:\s*(AM|PM)/)) {
          start = start.replace(/(\d{1,2}):\s*(AM|PM)/, '$1:00 $2');
          update = true;
        }
        if (end && end.match(/\d{1,2}:\s*(AM|PM)/)) {
          end = end.replace(/(\d{1,2}):\s*(AM|PM)/, '$1:00 $2');
          update = true;
        }
        
        if (update) {
          console.log('updating', b._id, start, end);
          await collection.updateOne({_id: b._id}, {$set: {'confirmedBooking.timeSlot.start': start, 'confirmedBooking.timeSlot.end': end}});
        }
      }
    }
    process.exit(0);
  });
