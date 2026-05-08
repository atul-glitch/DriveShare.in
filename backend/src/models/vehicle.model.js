import mongoose, { Schema } from "mongoose";

// ── Sub-schema: GeoJSON Location ────────────────────────────────────────────
const locationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
  },
  { _id: false }
);

// ── Main schema ──────────────────────────────────────────────────────────────
const vehicleSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },

    // ── Identity ─────────────────────────────────────────────────────────
    make: {
      type: String,
      required: [true, "Vehicle make is required"],
      trim: true,
    }, // e.g. "Maruti Suzuki"
    model: {
      type: String,
      required: [true, "Vehicle model is required"],
      trim: true,
    }, // e.g. "Swift Dzire"
    year: {
      type: Number,
      required: [true, "Manufacturing year is required"],
      min: [2000, "Year must be 2000 or later"],
      max: [new Date().getFullYear(), "Year cannot be in the future"],
    },
    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
      uppercase: true,
      trim: true,
      match: [
        /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/,
        "Invalid registration format (e.g. MH12AB1234)",
      ],
    },
    color: { type: String, trim: true, default: "" },

    // ── Category ──────────────────────────────────────────────────────────
    category: {
      type: String,
      enum: ["hatchback", "sedan", "suv", "muv", "bike", "scooter", "truck", "van"],
      required: [true, "Vehicle category is required"],
    },

    // ── Specs ─────────────────────────────────────────────────────────────
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "electric", "cng", "hybrid"],
      required: [true, "Fuel type is required"],
    },
    transmission: {
      type: String,
      enum: ["manual", "automatic", "amt"],
      default: "manual",
    },
    seats: {
      type: Number,
      required: [true, "Number of seats is required"],
      min: 1,
      max: 50,
    },
    mileage: {
      type: Number, // km/l or km/charge
      required: [true, "Mileage is required"],
      min: 0,
    },
    engineCC: {
      type: Number, // cubic centimetres; 0 for electric
      default: 0,
    },
    bootSpace: {
      type: Number, // litres, optional
    },
    hasAC: { type: Boolean, default: false },
    hasBluetooth: { type: Boolean, default: false },
    hasGPS: { type: Boolean, default: false },
    hasChildSeat: { type: Boolean, default: false },

    // ── Pricing ───────────────────────────────────────────────────────────
    ratePerHour: {
      type: Number,
      required: [true, "Hourly rate is required"],
      default: 120,
      min: [0, "Rate cannot be negative"],
    },
    insuranceAvailable: {
      type: Boolean,
      default: false,
    },
    insuranceFeePerHour: {
      type: Number,
      default: 0,
    },

    // ── Media ─────────────────────────────────────────────────────────────
    images: {
      type: [String], // Cloudinary URLs
      validate: [
        (arr) => arr.length >= 1,
        "At least one vehicle image is required",
      ],
    },

    // ── Location (GeoJSON for $geoNear / $near queries) ───────────────────
    currentLocation: {
      type: locationSchema,
      required: true,
    },

    // ── Status ────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["available", "booked", "maintenance", "inactive"],
      default: "available",
    },

    // ── Aggregated ratings (denormalised for fast reads) ──────────────────
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalTrips: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
vehicleSchema.index({ "currentLocation": "2dsphere" }); // geospatial
vehicleSchema.index({ owner: 1, status: 1 });
vehicleSchema.index({ category: 1, fuelType: 1 });
// vehicleSchema.index({ registrationNumber: 1 }, { unique: true });

export const Vehicle = mongoose.model("Vehicle", vehicleSchema);
