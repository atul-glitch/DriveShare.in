import { Admin, User, Vehicle } from "../models/index.js";
import { ApiError }    from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ── Cookie options ──────────────────────────────────────────────────────────
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

// ── Helper: generate both tokens and persist refresh token ─────────────────
const generateAdminTokens = async (adminId) => {
  const admin = await Admin.findById(adminId);
  const accessToken  = admin.generateAccessToken();
  const refreshToken = admin.generateRefreshToken();
  admin.refreshToken = refreshToken;
  await admin.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/admin/login
// Body: { loginId, password }
// ─────────────────────────────────────────────────────────────────────────────
export const adminLogin = asyncHandler(async (req, res) => {
  const { loginId, password } = req.body;

  if (!loginId || !password) {
    throw new ApiError(400, "Login ID and password are required");
  }

  const admin = await Admin.findOne({ loginId }).select("+password +refreshToken");

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  // ── Check if account is locked ────────────────────────────────────────────
  if (admin.isAccountLocked()) {
    throw new ApiError(423, "Account is locked. Please try again later");
  }

  if (!admin.isActive) {
    throw new ApiError(403, "Admin account has been deactivated");
  }

  // ── Verify password ───────────────────────────────────────────────────────
  const isMatch = await admin.isPasswordCorrect(password);
  if (!isMatch) {
    await admin.recordLoginAttempt();
    throw new ApiError(401, "Invalid credentials");
  }

  // ── Reset login attempts on successful login ──────────────────────────────
  await admin.resetLoginAttempts();

  // ── Generate tokens ───────────────────────────────────────────────────────
  const { accessToken, refreshToken } = await generateAdminTokens(admin._id);

  const loggedIn = await Admin.findById(admin._id).select("-password -refreshToken");

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, { admin: loggedIn, accessToken, refreshToken }, "Admin logged in successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/admin/logout
// ─────────────────────────────────────────────────────────────────────────────
export const adminLogout = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(req.admin._id, { refreshToken: null }, { new: true });

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Admin logged out successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/users
// Get all users with pagination
// ─────────────────────────────────────────────────────────────────────────────
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, isVerified, search } = req.query;

  const filter = {};
  if (isVerified !== undefined) {
    filter.isVerified = isVerified === "true";
  }

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const users = await User.find(filter)
    .populate("drivingLicence", "licenceNumber expiryDate")
    .populate("aadhar", "aadharNumber")
    .skip(skip)
    .limit(parseInt(limit))
    .select("-password -refreshToken")
    .lean();

  const total = await User.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    }, "Users fetched successfully")
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/admin/users/:userId/verify
// Verify a user (mark as verified)
// ─────────────────────────────────────────────────────────────────────────────
export const verifyUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByIdAndUpdate(
    userId,
    { isVerified: true },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(new ApiResponse(200, user, "User verified successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/admin/users/:userId/reject
// Reject a user (mark as not verified)
// ─────────────────────────────────────────────────────────────────────────────
export const rejectUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    { isVerified: false },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // TODO: Send rejection email to user with reason

  return res.status(200).json(new ApiResponse(200, user, "User rejected successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/admin/users/:userId/deactivate
// Deactivate a user account
// ─────────────────────────────────────────────────────────────────────────────
export const deactivateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(new ApiResponse(200, user, "User deactivated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/vehicles
// Get all vehicles with pagination
// ─────────────────────────────────────────────────────────────────────────────
export const getAllVehicles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;

  const filter = {};
  if (status) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { model: { $regex: search, $options: "i" } },
      { licensePlate: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const vehicles = await Vehicle.find(filter)
    .populate("owner", "fullName email phone")
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await Vehicle.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, {
      vehicles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    }, "Vehicles fetched successfully")
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/admin/vehicles/:vehicleId
// Delete a vehicle listing
// ─────────────────────────────────────────────────────────────────────────────
export const deleteVehicle = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const { reason } = req.body;

  const vehicle = await Vehicle.findByIdAndDelete(vehicleId);

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  // TODO: Send notification to vehicle owner about deletion with reason

  return res.status(200).json(new ApiResponse(200, vehicle, "Vehicle deleted successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/admin/vehicles/:vehicleId/toggle-status
// Toggle vehicle listing status (active/inactive)
// ─────────────────────────────────────────────────────────────────────────────
export const toggleVehicleStatus = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;

  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  vehicle.status = vehicle.status === "active" ? "inactive" : "active";
  await vehicle.save();

  return res.status(200).json(new ApiResponse(200, vehicle, "Vehicle status updated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/statistics
// Get admin dashboard statistics
// ─────────────────────────────────────────────────────────────────────────────
export const getStatistics = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const verifiedUsers = await User.countDocuments({ isVerified: true });
  const unverifiedUsers = await User.countDocuments({ isVerified: false });
  const activeUsers = await User.countDocuments({ isActive: true });

  const totalVehicles = await Vehicle.countDocuments();
  const activeVehicles = await Vehicle.countDocuments({ status: "active" });
  const inactiveVehicles = await Vehicle.countDocuments({ status: "inactive" });

  const stats = {
    users: {
      total: totalUsers,
      verified: verifiedUsers,
      unverified: unverifiedUsers,
      active: activeUsers,
    },
    vehicles: {
      total: totalVehicles,
      active: activeVehicles,
      inactive: inactiveVehicles,
    },
  };

  return res.status(200).json(new ApiResponse(200, stats, "Statistics fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/users/:userId
// Get detailed user information
// ─────────────────────────────────────────────────────────────────────────────
export const getUserDetails = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .populate("drivingLicence")
    .populate("aadhar")
    .select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(new ApiResponse(200, user, "User details fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/vehicles/:vehicleId
// Get detailed vehicle information
// ─────────────────────────────────────────────────────────────────────────────
export const getVehicleDetails = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;

  const vehicle = await Vehicle.findById(vehicleId).populate("owner", "fullName email phone");

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  return res.status(200).json(new ApiResponse(200, vehicle, "Vehicle details fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/admin/profile
// Update admin profile
// ─────────────────────────────────────────────────────────────────────────────
export const updateAdminProfile = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  const admin = await Admin.findByIdAndUpdate(
    req.admin._id,
    {
      ...(fullName && { fullName }),
      ...(email && { email }),
    },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(new ApiResponse(200, admin, "Admin profile updated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/admin/change-password
// Change admin password
// ─────────────────────────────────────────────────────────────────────────────
export const changeAdminPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }

  const admin = await Admin.findById(req.admin._id).select("+password");

  const isMatch = await admin.isPasswordCorrect(oldPassword);
  if (!isMatch) {
    throw new ApiError(401, "Old password is incorrect");
  }

  admin.password = newPassword;
  await admin.save();

  return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});
