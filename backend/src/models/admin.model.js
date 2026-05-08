import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const adminSchema = new Schema(
  {
    loginId: {
      type: String,
      required: [true, "Login ID is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // never returned by default
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["superAdmin", "admin"],
      default: "admin",
    },
    permissions: {
      manageUsers: {
        type: Boolean,
        default: true,
      },
      verifyUsers: {
        type: Boolean,
        default: true,
      },
      manageVehicles: {
        type: Boolean,
        default: true,
      },
      viewReports: {
        type: Boolean,
        default: true,
      },
      manageAdmins: {
        type: Boolean,
        default: false, // only superAdmin can manage admins
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },

    // ── Auth tokens ──────────────────────────────────────────────────────────
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────────────────────────────────
// adminSchema.index({ loginId: 1 });
// adminSchema.index({ email: 1 });

// ── Pre-save: hash password ────────────────────────────────────────────────
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance methods ───────────────────────────────────────────────────────
adminSchema.methods.isPasswordCorrect = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      loginId: this.loginId,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
};

adminSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );
};

adminSchema.methods.recordLoginAttempt = function () {
  this.loginAttempts += 1;
  if (this.loginAttempts >= 5) {
    this.isLocked = true;
    this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
  }
  return this.save();
};

adminSchema.methods.resetLoginAttempts = function () {
  this.loginAttempts = 0;
  this.isLocked = false;
  this.lockedUntil = null;
  this.lastLogin = new Date();
  return this.save();
};

adminSchema.methods.isAccountLocked = function () {
  if (!this.isLocked) return false;
  if (this.lockedUntil && this.lockedUntil < new Date()) {
    this.isLocked = false;
    this.lockedUntil = null;
    this.loginAttempts = 0;
    this.save();
    return false;
  }
  return true;
};

export const Admin = mongoose.model("Admin", adminSchema);
