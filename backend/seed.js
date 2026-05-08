/**
 * DriveShare — MongoDB Atlas Seed Script
 * Creates: 1 Owner User + 1 Car + 2 Bikes + 2 Scooties
 *
 * Usage:
 *   1. npm install mongoose bcryptjs dotenv
 *   2. Set MONGODB_URI in .env  (your Atlas connection string)
 *   3. node seed.js
 */

import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';
import dotenv   from 'dotenv';
dotenv.config();

// ── Connect ──────────────────────────────────────────────────────────────────
await mongoose.connect(`${process.env.MONGODB_URI}/vehicle_rental`);
console.log('✅ Connected to MongoDB Atlas');

// ── Minimal inline schemas (no need to import your full model files) ─────────
const userSchema = new mongoose.Schema({
  fullName:       String,
  email:          { type: String, unique: true },
  phone:          { type: String, unique: true },
  password:       String,
  role:           [String],
  avatar:         String,
  isVerified:     Boolean,
  isActive:       Boolean,
  drivingLicence: mongoose.Schema.Types.ObjectId,
  aadhar:         mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const vehicleSchema = new mongoose.Schema({
  owner:              mongoose.Schema.Types.ObjectId,
  make:               String,
  model:              String,
  year:               Number,
  registrationNumber: String,
  color:              String,
  category:           String,   // hatchback | sedan | suv | bike | scooter
  fuelType:           String,   // petrol | diesel | electric | cng | hybrid
  transmission:       String,   // manual | automatic | amt
  seats:              Number,
  mileage:            Number,
  engineCC:           Number,
  bootSpace:          Number,
  hasAC:              Boolean,
  hasBluetooth:       Boolean,
  hasGPS:             Boolean,
  hasChildSeat:       Boolean,
  ratePerHour:        Number,
  insuranceAvailable: Boolean,
  insuranceFeePerHour:Number,
  images:             [String],
  currentLocation: {
    type:        { type: String, default: 'Point' },
    coordinates: [Number],          // [longitude, latitude]
    address: {
      street:  String,
      city:    String,
      state:   String,
      pincode: String,
    },
  },
  status:        String,
  averageRating: Number,
  totalReviews:  Number,
  totalTrips:    Number,
}, { timestamps: true });

vehicleSchema.index({ currentLocation: '2dsphere' });

const User    = mongoose.models.User    || mongoose.model('User',    userSchema);
const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);

// ── 1. Create Owner User ─────────────────────────────────────────────────────
const hashedPwd = await bcrypt.hash('DriveShare@123', 12);

let owner = await User.findOne({ email: 'rahul.sharma@driveshare.in' });

if (owner) {
  console.log('ℹ️  Owner already exists — skipping user creation');
} else {
  owner = await User.create({
    fullName:   'Rahul Sharma',
    email:      'rahul.sharma@driveshare.in',
    phone:      '9876543210',
    password:   hashedPwd,
    role:       ['owner', 'renter'],
    avatar:     '',
    isVerified: true,
    isActive:   true,
  });
  console.log(`✅ Owner created → ${owner._id}  (${owner.fullName})`);
}

// ── 2. Seed Vehicles ─────────────────────────────────────────────────────────
// Location: Jamshedpur, Jharkhand (real coordinates)
const jamshedpur = {
  type:        'Point',
  coordinates: [86.2029, 22.8046],   // [lng, lat]
  address: {
    street:  'Bistupur Market Road',
    city:    'Jamshedpur',
    state:   'Jharkhand',
    pincode: '831001',
  },
};

const vehicles = [
  // ── 1. CAR ────────────────────────────────────────────────────────────────
  {
    owner:              owner._id,
    make:               'Maruti Suzuki',
    model:              'Swift Dzire',
    year:               2022,
    registrationNumber: 'JH05AB1234',
    color:              'Pearl White',
    category:           'sedan',
    fuelType:           'petrol',
    transmission:       'manual',
    seats:              5,
    mileage:            23,
    engineCC:           1197,
    bootSpace:          378,
    hasAC:              true,
    hasBluetooth:       true,
    hasGPS:             false,
    hasChildSeat:       false,
    ratePerHour:        120,
    insuranceAvailable: true,
    insuranceFeePerHour:15,
    images: [
      'https://imgd.aeplcdn.com/664x374/n/cw/ec/45691/swift-dzire-exterior-right-front-three-quarter-2.jpeg',
    ],
    currentLocation: jamshedpur,
    status:          'available',
    averageRating:   0,
    totalReviews:    0,
    totalTrips:      0,
  },

  // ── 2. BIKE 1 ────────────────────────────────────────────────────────────
  {
    owner:              owner._id,
    make:               'Royal Enfield',
    model:              'Classic 350',
    year:               2023,
    registrationNumber: 'JH05CD5678',
    color:              'Stealth Black',
    category:           'bike',
    fuelType:           'petrol',
    transmission:       'manual',
    seats:              2,
    mileage:            35,
    engineCC:           349,
    hasAC:              false,
    hasBluetooth:       true,
    hasGPS:             false,
    hasChildSeat:       false,
    ratePerHour:        80,
    insuranceAvailable: true,
    insuranceFeePerHour:10,
    images: [
      'https://imgd.aeplcdn.com/664x374/n/cw/ec/152993/classic-350-right-side-view.jpeg',
    ],
    currentLocation: {
      type:        'Point',
      coordinates: [86.2051, 22.8071],   // slightly offset
      address: {
        street:  'Sakchi Road',
        city:    'Jamshedpur',
        state:   'Jharkhand',
        pincode: '831001',
      },
    },
    status:        'available',
    averageRating: 0,
    totalReviews:  0,
    totalTrips:    0,
  },

  // ── 3. BIKE 2 ────────────────────────────────────────────────────────────
  {
    owner:              owner._id,
    make:               'Honda',
    model:              'CB Shine SP',
    year:               2021,
    registrationNumber: 'JH05EF9101',
    color:              'Athletic Blue Metallic',
    category:           'bike',
    fuelType:           'petrol',
    transmission:       'manual',
    seats:              2,
    mileage:            65,
    engineCC:           124,
    hasAC:              false,
    hasBluetooth:       false,
    hasGPS:             false,
    hasChildSeat:       false,
    ratePerHour:        50,
    insuranceAvailable: false,
    insuranceFeePerHour:0,
    images: [
      'https://imgd.aeplcdn.com/664x374/n/cw/ec/44686/cb-shine-sp-right-side-view.jpeg',
    ],
    currentLocation: {
      type:        'Point',
      coordinates: [86.1997, 22.8019],
      address: {
        street:  'Golmuri Colony',
        city:    'Jamshedpur',
        state:   'Jharkhand',
        pincode: '831003',
      },
    },
    status:        'available',
    averageRating: 0,
    totalReviews:  0,
    totalTrips:    0,
  },

  // ── 4. SCOOTY 1 ──────────────────────────────────────────────────────────
  {
    owner:              owner._id,
    make:               'Honda',
    model:              'Activa 6G',
    year:               2023,
    registrationNumber: 'JH05GH1122',
    color:              'Pearl Precious White',
    category:           'scooter',
    fuelType:           'petrol',
    transmission:       'automatic',
    seats:              2,
    mileage:            60,
    engineCC:           109,
    hasAC:              false,
    hasBluetooth:       false,
    hasGPS:             false,
    hasChildSeat:       false,
    ratePerHour:        40,
    insuranceAvailable: true,
    insuranceFeePerHour:8,
    images: [
      'https://imgd.aeplcdn.com/664x374/n/cw/ec/106899/activa-6g-right-side-view.jpeg',
    ],
    currentLocation: {
      type:        'Point',
      coordinates: [86.2078, 22.8058],
      address: {
        street:  'Telco Colony',
        city:    'Jamshedpur',
        state:   'Jharkhand',
        pincode: '831004',
      },
    },
    status:        'available',
    averageRating: 0,
    totalReviews:  0,
    totalTrips:    0,
  },

  // ── 5. SCOOTY 2 ──────────────────────────────────────────────────────────
  {
    owner:              owner._id,
    make:               'TVS',
    model:              'Jupiter Classic',
    year:               2022,
    registrationNumber: 'JH05IJ3344',
    color:              'Starlight Blue',
    category:           'scooter',
    fuelType:           'petrol',
    transmission:       'automatic',
    seats:              2,
    mileage:            62,
    engineCC:           109,
    hasAC:              false,
    hasBluetooth:       true,
    hasGPS:             false,
    hasChildSeat:       false,
    ratePerHour:        40,
    insuranceAvailable: false,
    insuranceFeePerHour:0,
    images: [
      'https://imgd.aeplcdn.com/664x374/n/cw/ec/44495/jupiter-right-side-view.jpeg',
    ],
    currentLocation: {
      type:        'Point',
      coordinates: [86.2005, 22.8090],
      address: {
        street:  'Kadma Main Road',
        city:    'Jamshedpur',
        state:   'Jharkhand',
        pincode: '831005',
      },
    },
    status:        'available',
    averageRating: 0,
    totalReviews:  0,
    totalTrips:    0,
  },
];

// ── 3. Insert vehicles (skip if registration already exists) ─────────────────
let created = 0;
let skipped = 0;

for (const v of vehicles) {
  const exists = await Vehicle.findOne({ registrationNumber: v.registrationNumber });
  if (exists) {
    console.log(`⚠️  Skip (already exists): ${v.make} ${v.model} [${v.registrationNumber}]`);
    skipped++;
  } else {
    const doc = await Vehicle.create(v);
    console.log(`✅ Created [${v.category.toUpperCase()}] ${v.make} ${v.model} → ${doc._id}`);
    created++;
  }
}

// ── 4. Summary ───────────────────────────────────────────────────────────────
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('       DriveShare Seed Complete');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  Owner   : ${owner.fullName} (${owner.email})`);
console.log(`  Password: DriveShare@123`);
console.log(`  Created : ${created} vehicle(s)`);
console.log(`  Skipped : ${skipped} vehicle(s) (already exist)`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n  Vehicles seeded:');
console.log('  1. [CAR]     Maruti Suzuki Swift Dzire 2022  — ₹120/hr');
console.log('  2. [BIKE]    Royal Enfield Classic 350 2023  — ₹80/hr');
console.log('  3. [BIKE]    Honda CB Shine SP 2021          — ₹50/hr');
console.log('  4. [SCOOTY]  Honda Activa 6G 2023            — ₹40/hr');
console.log('  5. [SCOOTY]  TVS Jupiter Classic 2022        — ₹40/hr');
console.log('\n  All vehicles located in Jamshedpur, Jharkhand');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

await mongoose.disconnect();
process.exit(0);
