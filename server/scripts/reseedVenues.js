/* eslint-env node */
/**
 * reseedVenues.js
 *
 * One-time script: wipes the Venue collection and inserts the 5 canonical
 * AICTE IDEA Lab venues.
 *
 * Schema field mapping
 * ────────────────────
 *  "features"  → amenities  ([String] array in the schema)
 *  "active"    → status: 'active'  (enum field in the schema)
 *  "image"     → bannerImage  (placeholder path; replace with real URL later)
 *
 * Usage (from project root)
 * ─────────────────────────
 *  node server/scripts/reseedVenues.js
 *
 * Or add to package.json scripts:
 *  "seed:venues": "node server/scripts/reseedVenues.js"
 */

import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import process from 'node:process'

import dotenv from 'dotenv'
import mongoose from 'mongoose'

// Resolve .env relative to this script's location
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../.env') })

// ─── Venue data ──────────────────────────────────────────────────────────────
//
// Each object uses ONLY existing Venue schema fields.
// "amenities" carries the feature list; "status" carries active state.
// "bannerImage" is a placeholder – swap for a real URL/path when available.
// "description" is kept to ≤ 500 chars to satisfy the schema maxlength.

const VENUES = [
  {
    name: 'Digital Fabrication & Rapid Prototyping',
    facilityType: 'Lab',
    capacity: 10,
    size: '',
    location: 'AICTE IDEA Lab',
    description:
      'Our lab enables fast and efficient conversion of ideas into physical prototypes using advanced 3D technologies.',
    amenities: [
      'FDM Prototyping Station',
      'DLP/SLA Prototyping Station',
      'Post-Processing Station',
      'High-Resolution 3D Scanner',
    ],
    equipment: [],
    inventory: [],
    bannerImage: '/placeholder-venue.jpg',
    gallery: [],
    status: 'active',
    wifiStatus: 'Good',
    currentOccupancy: 0,
  },
  {
    name: 'Electronics Prototyping',
    facilityType: 'Lab',
    capacity: 10,
    size: '',
    location: 'AICTE IDEA Lab',
    description:
      'Our Electronics Prototyping Lab provides a comprehensive environment for designing, testing, and developing electronic systems and embedded solutions.',
    amenities: [
      'Customized Electronics Workstation',
      'Electronics Workbench & Prototyping Setup',
      'Electronics Development Platform',
      'Robotics, IoT & Sensor Kit',
    ],
    equipment: [],
    inventory: [],
    bannerImage: '/placeholder-venue.jpg',
    gallery: [],
    status: 'active',
    wifiStatus: 'Good',
    currentOccupancy: 0,
  },
  {
    name: 'Mechanical Prototyping',
    facilityType: 'Lab',
    capacity: 10,
    size: '',
    location: 'AICTE IDEA Lab',
    description:
      'Our Mechanical Prototyping Lab offers advanced tools and machinery for precision fabrication, machining, and product development.',
    amenities: [
      'CNC CO\u2082 Laser Cutter (Full Setup)',
      'CNC 3-Axis Router (Full Setup)',
      'V48 Vinyl Cutter Plotter',
      'Customized Mechanical Workstation',
      'CNC Metal/PCB Milling Machine (Full Setup)',
      'Mechanical & Power Tools',
      'Desktop Wood Lathe Setup',
      'Accessories, Consumables & Safety Equipment',
    ],
    equipment: [],
    inventory: [],
    bannerImage: '/placeholder-venue.jpg',
    gallery: [],
    status: 'active',
    wifiStatus: 'Good',
    currentOccupancy: 0,
  },
  {
    name: 'IDEA CAFE',
    facilityType: 'Cafe',
    capacity: 20,
    size: '',
    location: 'AICTE IDEA Lab',
    description:
      'Idea Cafe is a collaborative and creative space within the AICTE IDEA Lab that encourages students and faculty to brainstorm, discuss, and develop innovative ideas. It serves as an informal environment for interdisciplinary interaction, fostering creativity, problem-solving, and the transformation of ideas into feasible prototypes and solutions.',
    amenities: [],
    equipment: [],
    inventory: [],
    bannerImage: '/placeholder-venue.jpg',
    gallery: [],
    status: 'active',
    wifiStatus: 'Good',
    currentOccupancy: 0,
  },
  {
    name: 'Design Wing',
    facilityType: 'Studio',
    capacity: 20,
    size: '',
    location: 'AICTE IDEA Lab',
    description:
      'The Design Wing is equipped with high-end computing systems to support advanced design, modeling, and simulation tasks.',
    amenities: [
      'High-Performance Systems (Intel i7/i5 processors)',
      'Advanced Design Capabilities (CAD, 3D modeling, simulation, multimedia)',
      'High-Resolution Monitors',
      'Optimized Work Environment',
    ],
    equipment: [],
    inventory: [],
    bannerImage: '/placeholder-venue.jpg',
    gallery: [],
    status: 'active',
    wifiStatus: 'Good',
    currentOccupancy: 0,
  },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set in server/.env')
  }

  console.log('🔌 Connecting to MongoDB...')
  await mongoose.connect(mongoUri)
  console.log('✅ Connected.')

  // Lazy-import the model AFTER the connection is established
  const { default: Venue } = await import('../models/Venue.js')

  // ── Step 1: wipe existing venues ───────────────────────────────────────────
  const { deletedCount } = await Venue.deleteMany({})
  console.log(`🗑️  Deleted ${deletedCount} existing venue document(s).`)

  // ── Step 2: insert the 5 canonical venues ──────────────────────────────────
  const inserted = await Venue.insertMany(VENUES, { ordered: true })
  console.log(`✅ Inserted ${inserted.length} venue(s):`)
  inserted.forEach((v, i) => {
    console.log(`   ${i + 1}. [${v._id}] ${v.name}`)
  })

  console.log('\n🎉 Venue reseed complete.')
}

run()
  .catch((err) => {
    console.error('❌ Reseed failed:', err.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB.')
  })
