import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Venue from '../models/Venue.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Helper to strip the origin from absolute URLs
const stripOrigin = (url) => {
  if (!url || typeof url !== 'string') return url;
  try {
    const parsed = new URL(url);
    // Returns only the relative path (e.g. /api/facilities/media/xyz)
    return parsed.pathname + parsed.search + parsed.hash;
  } catch (e) {
    return url; // If it's not a valid absolute URL, return as-is
  }
};

const runMigration = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const venues = await Venue.find({});
    let totalUpdated = 0;

    for (const venue of venues) {
      let isModified = false;
      const updates = [];

      // 1. Check bannerImage
      if (venue.bannerImage && (venue.bannerImage.startsWith('http://') || venue.bannerImage.startsWith('https://'))) {
        const oldVal = venue.bannerImage;
        const newVal = stripOrigin(oldVal);
        if (oldVal !== newVal) {
          venue.bannerImage = newVal;
          updates.push(`bannerImage: ${oldVal}  ->  ${newVal}`);
          isModified = true;
        }
      }

      // 2. Check gallery array
      if (venue.gallery && venue.gallery.length > 0) {
        for (let i = 0; i < venue.gallery.length; i++) {
          const oldVal = venue.gallery[i];
          if (oldVal && (oldVal.startsWith('http://') || oldVal.startsWith('https://'))) {
            const newVal = stripOrigin(oldVal);
            if (oldVal !== newVal) {
              venue.gallery[i] = newVal;
              updates.push(`gallery[${i}]: ${oldVal}  ->  ${newVal}`);
              isModified = true;
            }
          }
        }
      }

      // 3. Check equipment array
      if (venue.equipment && venue.equipment.length > 0) {
        for (let i = 0; i < venue.equipment.length; i++) {
          const eq = venue.equipment[i];
          if (eq.image && (eq.image.startsWith('http://') || eq.image.startsWith('https://'))) {
            const oldVal = eq.image;
            const newVal = stripOrigin(oldVal);
            if (oldVal !== newVal) {
              venue.equipment[i].image = newVal;
              updates.push(`equipment[${i}].image: ${oldVal}  ->  ${newVal}`);
              isModified = true;
            }
          }
        }
      }

      // Save if changes were detected
      if (isModified) {
        venue.markModified('gallery');
        venue.markModified('equipment');
        await venue.save();
        
        console.log(`\nUpdated Venue: ${venue.name} (${venue._id})`);
        updates.forEach(u => console.log(`  - ${u}`));
        totalUpdated++;
      }
    }

    console.log(`\nMigration complete. Updated ${totalUpdated} venue(s).`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

runMigration();
