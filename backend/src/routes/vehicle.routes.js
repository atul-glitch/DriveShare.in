import { Router } from "express";
import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getMyVehicles,
} from "../controllers/vehicle.controller.js";
import { verifyJWT, authorizeRoles, requireVerified } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// Public
router.get("/", getAllVehicles);

// Protected
router.use(verifyJWT);

router.get("/my-listings", authorizeRoles("owner"), getMyVehicles);

router.post(
  "/",
  authorizeRoles("owner"),
  requireVerified,
  upload.fields([{ name: "images", maxCount: 8 }]),
  createVehicle
);

router.patch("/:id", authorizeRoles("owner"), updateVehicle);
router.delete("/:id", authorizeRoles("owner"), deleteVehicle);

// Keep the dynamic route last so it does not capture /my-listings.
router.get("/:id", getVehicleById);

export default router;
