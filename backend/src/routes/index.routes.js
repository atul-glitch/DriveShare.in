import { Router } from "express";
import {
  createBooking, confirmBooking, markPickup, markReturn,
  cancelBooking, getMyBookings, getOwnerBookings, getBookingById,
} from "../controllers/booking.controller.js";
import {
  sendMessage, getMessages, deleteMessage, getUnreadCount,
} from "../controllers/message.controller.js";
import {
  createReview, replyToReview, getVehicleReviews, getUserReviews,
} from "../controllers/review.controller.js";
import {
  initiatePayment, verifyPayment, getPaymentByBooking, getMyEarnings, mockVerifyPayment,
} from "../controllers/payment.controller.js";
import { verifyJWT, authorizeRoles, requireVerified } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

// ────────────────────────────────────────────────────────────────────────────
// BOOKING ROUTES   /api/v1/bookings
// ────────────────────────────────────────────────────────────────────────────
export const bookingRouter = Router();
bookingRouter.use(verifyJWT);

bookingRouter.post   ("/",                    authorizeRoles("renter"), requireVerified, createBooking);
bookingRouter.get    ("/my-bookings",         authorizeRoles("renter"), getMyBookings);
bookingRouter.get    ("/owner-bookings",      authorizeRoles("owner"),  getOwnerBookings);
bookingRouter.get    ("/:id",                 getBookingById);
bookingRouter.patch  ("/:id/confirm",         authorizeRoles("owner"),  confirmBooking);
bookingRouter.patch  ("/:id/pickup",          authorizeRoles("owner"),  markPickup);
bookingRouter.patch  ("/:id/return",          authorizeRoles("owner"),  markReturn);
bookingRouter.patch  ("/:id/cancel",          cancelBooking);

// ────────────────────────────────────────────────────────────────────────────
// MESSAGE ROUTES   /api/v1/messages
// ────────────────────────────────────────────────────────────────────────────
export const messageRouter = Router();
messageRouter.use(verifyJWT);

messageRouter.post  ("/",                    upload.single("image"), sendMessage);
messageRouter.get   ("/unread-count",        getUnreadCount);
messageRouter.get   ("/:bookingId",          getMessages);
messageRouter.delete("/:id",                 deleteMessage);

// ────────────────────────────────────────────────────────────────────────────
// REVIEW ROUTES   /api/v1/reviews
// ────────────────────────────────────────────────────────────────────────────
export const reviewRouter = Router();
reviewRouter.use(verifyJWT);

reviewRouter.post  ("/",                          authorizeRoles("renter"), upload.fields([{ name: "images", maxCount: 5 }]), createReview);
reviewRouter.patch ("/:id/reply",                 authorizeRoles("owner"),  replyToReview);
reviewRouter.get   ("/vehicle/:vehicleId",        getVehicleReviews);
reviewRouter.get   ("/user/:userId",              getUserReviews);

// ────────────────────────────────────────────────────────────────────────────
// PAYMENT ROUTES   /api/v1/payments
// ────────────────────────────────────────────────────────────────────────────
export const paymentRouter = Router();
paymentRouter.use(verifyJWT);

paymentRouter.get  ("/my-earnings",            authorizeRoles("owner"),  getMyEarnings);
paymentRouter.get  ("/:bookingId",             getPaymentByBooking);
paymentRouter.post ("/:bookingId/initiate",    initiatePayment);
paymentRouter.post ("/:bookingId/verify",      verifyPayment);
paymentRouter.post ("/:bookingId/mock-verify", mockVerifyPayment);
