import mongoose, { Schema } from "mongoose";

const drivingLicenceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    licenceNumber: {
      type: String,
      required: [true, "Licence number is required"],
      unique: true,
      uppercase: true,
      trim: true,
      // match: [
      //   /^[A-Z]{2}\d{2}\s?\d{11}$/,
      //   "Invalid Indian driving licence format (e.g. MH0120210012345)",
      // ],
    },
    frontImage: {
      type: String, // Cloudinary URL
      required: [true, "Front image is required"],
    },
    backImage: {
      type: String, // Cloudinary URL
      required: [true, "Back image is required"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    vehicleClasses: {
      type: [String], // e.g. ["LMV", "MCWG"]
      default: [],
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

// drivingLicenceSchema.index({ licenceNumber: 1 });
// drivingLicenceSchema.index({ user: 1 });

export const DrivingLicence = mongoose.model(
  "DrivingLicence",
  drivingLicenceSchema
);
