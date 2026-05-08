import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentUserPassword,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { verifyJWT }                from "../middleware/auth.middleware.js";
import { upload }                   from "../middleware/multer.middleware.js";

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.post(
  "/register",
  upload.fields([
    { name: "dl_front",      maxCount: 1 },
    { name: "dl_back",       maxCount: 1 },
    { name: "aadhar_front",  maxCount: 1 },
    { name: "aadhar_back",   maxCount: 1 },
    { name: "avatar",        maxCount: 1 },
  ]),
  registerUser
);

router.post("/login",         loginUser);
router.post("/refresh-token", refreshAccessToken);

// ── Protected ─────────────────────────────────────────────────────────────────
router.use(verifyJWT);

router.post  ("/logout",          logoutUser);
router.patch ("/change-password", changeCurrentUserPassword);
router.get   ("/me",              getCurrentUser);

export default router;
