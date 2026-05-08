import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true, // one review per booking
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    // ── Ratings (1 – 5) ───────────────────────────────────────────────────
    vehicleRating: {
      type: Number,
      required: [true, "Vehicle rating is required"],
      min: 1,
      max: 5,
    },
    ownerRating: {
      type: Number,
      required: [true, "Owner rating is required"],
      min: 1,
      max: 5,
    },
    overallRating: {
      type: Number,
      required: [true, "Overall rating is required"],
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Review comment cannot exceed 1000 characters"],
      default: "",
    },
    images: {
      type: [String], // Cloudinary URLs — optional photos by renter
      default: [],
    },

    // owner's public reply
    ownerReply: {
      type: String,
      trim: true,
      maxlength: [500, "Reply cannot exceed 500 characters"],
      default: "",
    },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
reviewSchema.index({ vehicle: 1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ reviewee: 1 });

// ── Post-save: update Vehicle.averageRating & Vehicle.totalReviews ─────────
reviewSchema.post("save", async function () {
  const Vehicle = mongoose.model("Vehicle");
  const stats = await mongoose.model("Review").aggregate([
    { $match: { vehicle: this.vehicle } },
    {
      $group: {
        _id: "$vehicle",
        avgRating: { $avg: "$overallRating" },
        count: { $sum: 1 },
      },
    },
  ]);
  if (stats.length > 0) {
    await Vehicle.findByIdAndUpdate(this.vehicle, {
      averageRating: parseFloat(stats[0].avgRating.toFixed(2)),
      totalReviews: stats[0].count,
    });
  }
});

export const Review = mongoose.model("Review", reviewSchema);
