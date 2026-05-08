import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ── Verify access token ───────────────────────────────────────────────────────
export const verifyJWT = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) throw new ApiError(401, "Unauthorized — no token provided");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired access token");
  }

  const user = await User.findById(decoded._id).select(
    "-password -refreshToken"
  );
  if (!user) throw new ApiError(401, "User not found");
  if (!user.isActive) throw new ApiError(403, "Account is deactivated");

  req.user = user;
  next();
});

// ── Role guard (pass one or more allowed roles) ───────────────────────────────
// Usage: authorizeRoles("owner")  or  authorizeRoles("owner", "renter")
export const authorizeRoles = (...roles) =>
  asyncHandler(async (req, _, next) => {
    const hasRole = req.user?.role?.some((r) => roles.includes(r));
    if (!hasRole) {
      throw new ApiError(
        403,
        `Access denied — required role(s): ${roles.join(", ")}`
      );
    }
    next();
  });

// ── Verified-user guard ───────────────────────────────────────────────────────
export const requireVerified = asyncHandler(async (req, _, next) => {
  if (!req.user?.isVerified) {
    throw new ApiError(
      403,
      "Please complete KYC verification (Aadhar + Driving Licence) first"
    );
  }
  next();
});
