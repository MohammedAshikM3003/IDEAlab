import mongoose from 'mongoose'

const inventorySchema = new mongoose.Schema(
  {
    itemName: { type: String },
    quantity: { type: Number },
    condition: {
      type: String,
      enum: ['Good', 'Fair', 'Poor'],
      default: 'Good',
    },
  },
  { _id: false },
)

const equipmentSchema = new mongoose.Schema(
  {
    image: { type: String },
    itemDetails: { type: String },
    quantity: { type: Number },
    condition: { type: String },
    description: { type: String },
  },
  { _id: false },
)

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  facilityType: { type: String },
  capacity: { type: Number },
  location: { type: String },
  description: { type: String, maxlength: 500 },
  inventory: [inventorySchema],
  equipment: [equipmentSchema],
  amenities: [{ type: String }],
  bannerImage: { type: String },
  gallery: [{ type: String }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
  },
  wifiStatus: { type: String, default: 'Good' },
  currentOccupancy: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const Venue = mongoose.models.Venue || mongoose.model('Venue', venueSchema)

export default Venue
