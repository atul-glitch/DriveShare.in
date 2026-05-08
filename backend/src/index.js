import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./utils/db.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { User } from "./models/index.js";

import authRoutes    from "./routes/auth.routes.js";
import adminRoutes   from "./routes/admin.routes.js";
import vehicleRoutes from "./routes/vehicle.routes.js";
import {
  bookingRouter,
  messageRouter,
  reviewRouter,
  paymentRouter,
} from "./routes/index.routes.js";

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Global middleware ─────────────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.CORS_ORIGIN || "*",
  credentials: true,
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_, res) => res.json({ status: "ok", timestamp: new Date() }));

// ── API routes ────────────────────────────────────────────────────────────────
const API = "/api/v1";
app.use(`${API}/auth`,     authRoutes);
app.use(`${API}/admin`,    adminRoutes);
app.use(`${API}/vehicles`, vehicleRoutes);
app.use(`${API}/bookings`, bookingRouter);
app.use(`${API}/messages`, messageRouter);
app.use(`${API}/reviews`,  reviewRouter);
app.use(`${API}/payments`, paymentRouter);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Boot ──────────────────────────────────────────────────────────────────────
connectDB().then(() => {
  User.collection
    .dropIndex("username_1")
    .then(() => console.log("✅ Removed stale users.username_1 index"))
    .catch((error) => {
      if (error?.codeName !== "IndexNotFound" && error?.code !== 27) {
        console.warn("⚠️ Could not drop legacy username index:", error.message);
      }
    })
    .finally(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    });
});

export default app;
