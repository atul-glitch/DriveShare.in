import { User, DrivingLicence, Aadhar } from "../models/index.js";
import { ApiError }    from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

// ── Cookie options ──────────────────────────────────────────────────────────
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

// ── Helper: generate both tokens and persist refresh token ─────────────────
const generateTokens = async (userId) => {
  const user = await User.findById(userId);
  const accessToken  = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/register
// Body (multipart/form-data):
//   fullName, email, phone, password, role[]
//   dl_number, dl_dob, dl_expiry, dl_classes[], dl_front (file), dl_back (file)
//   aadhar_number, aadhar_name, aadhar_dob, aadhar_street, aadhar_city,
//   aadhar_state, aadhar_pincode, aadhar_front (file), aadhar_back (file)
// ─────────────────────────────────────────────────────────────────────────────
export const registerUser = asyncHandler(async (req, res) => {
  const {
    fullName, email, phone, password, role,
    dl_number, dl_dob, dl_expiry, dl_classes,
    aadhar_number, aadhar_name, aadhar_dob,
    aadhar_street, aadhar_city, aadhar_state, aadhar_pincode,
  } = req.body;

  // ── Basic validation ──────────────────────────────────────────────────────
  if ([fullName, email, phone, password].some((f) => !f?.trim())) {
    throw new ApiError(400, "fullName, email, phone and password are required");
  }

  // ── Check duplicates ──────────────────────────────────────────────────────
  const existing = await User.findOne({ $or: [{ email }, { phone }] });
  if (existing) {
    throw new ApiError(409, "User with this email or phone already exists");
  }

  // ── Upload DL images ──────────────────────────────────────────────────────
  const dlFrontPath = req.files?.dl_front?.[0]?.path;
  const dlBackPath  = req.files?.dl_back?.[0]?.path;
  if (!dlFrontPath || !dlBackPath) {
    throw new ApiError(400, "Driving licence front and back images are required");
  }
  const [dlFront, dlBack] = await Promise.all([
    uploadOnCloudinary(dlFrontPath, "dl"),
    uploadOnCloudinary(dlBackPath,  "dl"),
  ]);
  if (!dlFront || !dlBack) throw new ApiError(500, "DL image upload failed");

  // ── Upload Aadhar images ──────────────────────────────────────────────────
  const aadharFrontPath = req.files?.aadhar_front?.[0]?.path;
  const aadharBackPath  = req.files?.aadhar_back?.[0]?.path;
  if (!aadharFrontPath || !aadharBackPath) {
    throw new ApiError(400, "Aadhar front and back images are required");
  }
  const [aadharFront, aadharBack] = await Promise.all([
    uploadOnCloudinary(aadharFrontPath, "aadhar"),
    uploadOnCloudinary(aadharBackPath,  "aadhar"),
  ]);
  if (!aadharFront || !aadharBack) throw new ApiError(500, "Aadhar image upload failed");

  // ── Create User ───────────────────────────────────────────────────────────
  const user = await User.create({
    fullName,
    email,
    phone,
    password,
    role: Array.isArray(role) ? role : [role || "renter"],
  });

  // ── Create DrivingLicence ─────────────────────────────────────────────────
  const dl = await DrivingLicence.create({
    user: user._id,
    licenceNumber: dl_number,
    frontImage:    dlFront.secure_url,
    backImage:     dlBack.secure_url,
    dateOfBirth:   dl_dob,
    expiryDate:    dl_expiry,
    vehicleClasses: Array.isArray(dl_classes)
      ? dl_classes
      : dl_classes?.split(",").map((c) => c.trim()) || [],
  });

  // ── Create Aadhar ─────────────────────────────────────────────────────────
  const aadhar = await Aadhar.create({
    user:        user._id,
    aadharNumber: aadhar_number,
    frontImage:  aadharFront.secure_url,
    backImage:   aadharBack.secure_url,
    nameOnAadhar: aadhar_name,
    dateOfBirth: aadhar_dob,
    address: {
      street:  aadhar_street,
      city:    aadhar_city,
      state:   aadhar_state,
      pincode: aadhar_pincode,
    },
  });

  // ── Link docs back to User ────────────────────────────────────────────────
  user.drivingLicence = dl._id;
  user.aadhar = aadhar._id;
  await user.save({ validateBeforeSave: false });

  const created = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(201)
    .json(new ApiResponse(201, created, "User registered successfully. KYC pending verification."));
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/login
// Body: { email, phone (either), password }
// ─────────────────────────────────────────────────────────────────────────────
export const loginUser = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;

  if (!password || (!email && !phone)) {
    throw new ApiError(400, "Email or phone, and password are required");
  }

  const user = await User.findOne({
    $or: [{ email }, { phone }],
  }).select("+password +refreshToken");

  if (!user) throw new ApiError(404, "User not found");
  if (!user.isActive) throw new ApiError(403, "Account has been deactivated");

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const loggedIn = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 min
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json(
      new ApiResponse(200, { user: loggedIn, accessToken, refreshToken }, "Login successful")
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/logout   (requires verifyJWT)
// ─────────────────────────────────────────────────────────────────────────────
export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/refresh-token
// Body or cookie: refreshToken
// ─────────────────────────────────────────────────────────────────────────────
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!incomingToken) throw new ApiError(401, "Refresh token is required");

  let decoded;
  try {
    decoded = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded._id).select("+refreshToken");
  if (!user || user.refreshToken !== incomingToken) {
    throw new ApiError(401, "Refresh token has been revoked");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(new ApiResponse(200, { accessToken, refreshToken }, "Tokens refreshed"));
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/auth/change-password   (requires verifyJWT)
// Body: { oldPassword, newPassword, confirmPassword }
// ─────────────────────────────────────────────────────────────────────────────
export const changeCurrentUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, "oldPassword, newPassword and confirmPassword are required");
  }
  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "New passwords do not match");
  }
  if (newPassword.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }
  if (oldPassword === newPassword) {
    throw new ApiError(400, "New password must differ from old password");
  }

  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.isPasswordCorrect(oldPassword);
  if (!isMatch) throw new ApiError(400, "Old password is incorrect");

  user.password = newPassword;
  await user.save();          // pre-save hook hashes the new password

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/auth/me   (requires verifyJWT)
// ─────────────────────────────────────────────────────────────────────────────
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("drivingLicence", "-__v")
    .populate("aadhar", "-__v");

  return res.status(200).json(new ApiResponse(200, user, "Current user fetched"));
});
