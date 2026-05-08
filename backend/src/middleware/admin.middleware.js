import jwt from "jsonwebtoken";
import { Admin } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyAdminToken = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized: No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const admin = await Admin.findById(decoded._id);
    if (!admin) {
      throw new ApiError(401, "Unauthorized: Admin not found");
    }

    if (!admin.isActive) {
      throw new ApiError(403, "Forbidden: Admin account is deactivated");
    }

    req.admin = admin;
    next();
  } catch (error) {
    throw new ApiError(401, error.message || "Unauthorized: Invalid token");
  }
});

export const checkPermission = (requiredPermission) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.admin) {
      throw new ApiError(401, "Unauthorized: No admin found");
    }

    // SuperAdmin has all permissions
    if (req.admin.role === "superAdmin") {
      return next();
    }

    // Check specific permission
    if (!req.admin.permissions[requiredPermission]) {
      throw new ApiError(
        403,
        `Forbidden: You do not have permission to ${requiredPermission}`
      );
    }

    next();
  });
};

export const verifyAdminRole = (allowedRoles = ["admin", "superAdmin"]) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.admin) {
      throw new ApiError(401, "Unauthorized: No admin found");
    }

    if (!allowedRoles.includes(req.admin.role)) {
      throw new ApiError(
        403,
        `Forbidden: Only ${allowedRoles.join(", ")} can access this resource`
      );
    }

    next();
  });
};
