import { Router } from "express";
import {
  adminLogin,
  adminLogout,
  getAllUsers,
  verifyUser,
  rejectUser,
  deactivateUser,
  getAllVehicles,
  deleteVehicle,
  toggleVehicleStatus,
  getStatistics,
  getUserDetails,
  getVehicleDetails,
  updateAdminProfile,
  changeAdminPassword,
} from "../controllers/admin.controller.js";
import {
  verifyAdminToken,
  checkPermission,
  verifyAdminRole,
} from "../middleware/admin.middleware.js";

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
// Admin Login
router.post("/login", adminLogin);

// ── Protected (All admin routes require authentication) ────────────────────────
router.use(verifyAdminToken);

// Admin Logout
router.post("/logout", adminLogout);

// ── Admin Profile Management ──────────────────────────────────────────────────
router.patch("/profile", updateAdminProfile);
router.patch("/change-password", changeAdminPassword);

// ── Admin Statistics ──────────────────────────────────────────────────────────
router.get("/statistics", getStatistics);

// ── User Management ───────────────────────────────────────────────────────────
router.get(
  "/users",
  checkPermission("manageUsers"),
  getAllUsers
);

router.get(
  "/users/:userId",
  checkPermission("manageUsers"),
  getUserDetails
);

router.patch(
  "/users/:userId/verify",
  checkPermission("verifyUsers"),
  verifyUser
);

router.patch(
  "/users/:userId/reject",
  checkPermission("verifyUsers"),
  rejectUser
);

router.patch(
  "/users/:userId/deactivate",
  checkPermission("manageUsers"),
  deactivateUser
);

// ── Vehicle Management ────────────────────────────────────────────────────────
router.get(
  "/vehicles",
  checkPermission("manageVehicles"),
  getAllVehicles
);

router.get(
  "/vehicles/:vehicleId",
  checkPermission("manageVehicles"),
  getVehicleDetails
);

router.delete(
  "/vehicles/:vehicleId",
  checkPermission("manageVehicles"),
  deleteVehicle
);

router.patch(
  "/vehicles/:vehicleId/toggle-status",
  checkPermission("manageVehicles"),
  toggleVehicleStatus
);

export default router;
