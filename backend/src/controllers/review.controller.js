import { Review, Booking } from "../models/index.js";
import { ApiError }    from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/reviews      (renter only, booking must be completed)
// ─────────────────────────────────────────────────────────────────────────────
export const createReview = asyncHandler(async (req, res) => {
  const { bookingId, vehicleRating, ownerRating, overallRating, comment } = req.body;

  if (!bookingId || !vehicleRating || !ownerRating || !overallRating) {
    throw new ApiError(400, "bookingId, vehicleRating, ownerRating, overallRating are required");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.renter.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only the renter can leave a review");
  }
  if (booking.status !== "completed") {
    throw new ApiError(400, "Can only review completed bookings");
  }

  const existing = await Review.findOne({ booking: bookingId });
  if (existing) throw new ApiError(409, "You have already reviewed this booking");

  // Upload review images if any
  let imageUrls = [];
  if (req.files?.images?.length) {
    const uploads = await Promise.all(
      req.files.images.map((f) => uploadOnCloudinary(f.path, "reviews"))
    );
    imageUrls = uploads.filter(Boolean).map((u) => u.secure_url);
  }

  const review = await Review.create({
    booking:  bookingId,
    reviewer: req.user._id,
    reviewee: booking.owner,
    vehicle:  booking.vehicle,
    vehicleRating:  Number(vehicleRating),
    ownerRating:    Number(ownerRating),
    overallRating:  Number(overallRating),
    comment: comment?.trim() || "",
    images: imageUrls,
  });
  // post-save hook on Review model updates Vehicle.averageRating automatically

  return res.status(201).json(new ApiResponse(201, review, "Review submitted successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/reviews/:id/reply    (owner adds public reply)
// ─────────────────────────────────────────────────────────────────────────────
export const replyToReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");
  if (review.reviewee.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only the reviewee can reply");
  }
  if (review.ownerReply) throw new ApiError(400, "Reply already submitted");

  review.ownerReply = req.body.reply?.trim();
  if (!review.ownerReply) throw new ApiError(400, "Reply cannot be empty");
  await review.save();

  return res.status(200).json(new ApiResponse(200, review, "Reply added"));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/reviews/vehicle/:vehicleId?page=1&limit=10
// ─────────────────────────────────────────────────────────────────────────────
export const getVehicleReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [reviews, total] = await Promise.all([
    Review.find({ vehicle: req.params.vehicleId })
      .populate("reviewer", "fullName avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Review.countDocuments({ vehicle: req.params.vehicleId }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, { reviews, pagination: { total, page: Number(page), limit: Number(limit) } },
      "Vehicle reviews fetched")
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/reviews/user/:userId?page=1&limit=10
// ─────────────────────────────────────────────────────────────────────────────
export const getUserReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [reviews, total] = await Promise.all([
    Review.find({ reviewee: req.params.userId })
      .populate("reviewer", "fullName avatar")
      .populate("vehicle", "make model images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Review.countDocuments({ reviewee: req.params.userId }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, { reviews, pagination: { total, page: Number(page), limit: Number(limit) } },
      "User reviews fetched")
  );
});
