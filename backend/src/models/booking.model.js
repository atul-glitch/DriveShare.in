import mongoose, { Schema } from "mongoose";

const locationSnapshotSchema = new Schema(
  {
    coordinates: { type: [Number], required: true }, // [lng, lat]
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
  },
  { _id: false }
);

const bookingSchema = new Schema(
  {
    renter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Renter is required"],
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle is required"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },

    // ── Time window ───────────────────────────────────────────────────────
    scheduledPickupAt: {
      type: Date,
      required: [true, "Pickup time is required"],
    },
    scheduledReturnAt: {
      type: Date,
      required: [true, "Return time is required"],
    },
    actualPickupAt: { type: Date },
    actualReturnAt: { type: Date },

    // ── Locations ─────────────────────────────────────────────────────────
    pickupLocation: {
      type: locationSnapshotSchema,
      required: true,
    },
    deliveryLocation: {
      type: locationSnapshotSchema,
    },

    // ── Status ────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: [
        "pending",    // awaiting owner confirmation
        "confirmed",  // owner accepted
        "active",     // vehicle handed over
        "completed",  // vehicle returned
        "cancelled",
        "disputed",
      ],
      default: "pending",
    },
    cancellationReason: { type: String, default: "" },

    // ── Fare snapshot (calculated at booking time) ────────────────────────
    ratePerHour: {
      type: Number,
      required: true,
    },
    estimatedHours: { type: Number },
    insuranceOpted: { type: Boolean, default: false },
    insuranceFeePerHour: { type: Number, default: 0 },

    // ── Payment ref ───────────────────────────────────────────────────────
    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
bookingSchema.index({ renter: 1, status: 1 });
bookingSchema.index({ vehicle: 1, status: 1 });
bookingSchema.index({ owner: 1, status: 1 });
bookingSchema.index({ scheduledPickupAt: 1, scheduledReturnAt: 1 });

export const Booking = mongoose.model("Booking", bookingSchema);
