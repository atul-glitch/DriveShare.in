import mongoose, { Schema } from "mongoose";

const aadharSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    aadharNumber: {
      type: String,
      required: [true, "Aadhar number is required"],
      unique: true,
      trim: true,
      match: [/^\d{12}$/, "Aadhar number must be exactly 12 digits"],
    },
    frontImage: {
      type: String, // Cloudinary URL
      required: [true, "Front image of Aadhar is required"],
    },
    backImage: {
      type: String, // Cloudinary URL
      required: [true, "Back image of Aadhar is required"],
    },
    nameOnAadhar: {
      type: String,
      required: [true, "Name as on Aadhar is required"],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: {
        type: String,
        match: [/^\d{6}$/, "Pincode must be 6 digits"],
      },
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// aadharSchema.index({ aadharNumber: 1 });
// aadharSchema.index({ user: 1 });

export const Aadhar = mongoose.model("Aadhar", aadharSchema);
