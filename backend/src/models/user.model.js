import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      // unique: true,
      // trim: true,
      // match: [/^[6-9]\d{9}$/, "Please provide a valid Indian mobile number"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // never returned by default
    },
    avatar: {
      type: String, // Cloudinary URL
      default: "",
    },
    role: {
      type: [String],
      enum: ["renter", "owner"],
      default: ["renter"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Auth tokens ──────────────────────────────────────────────────────────
    refreshToken: {
      type: String,
      select: false,
    },

    // ── Verification documents (populated refs) ───────────────────────────
    drivingLicence: {
      type: Schema.Types.ObjectId,
      ref: "DrivingLicence",
    },
    aadhar: {
      type: Schema.Types.ObjectId,
      ref: "Aadhar",
    },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────────────────────────────────
// userSchema.index({ email: 1 });
// userSchema.index({ phone: 1 });

// ── Pre-save: hash password ────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance methods ───────────────────────────────────────────────────────
userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );
};

export const User = mongoose.model("User", userSchema);
