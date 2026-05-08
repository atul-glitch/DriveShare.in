import mongoose from "mongoose";
import { Booking, Vehicle, Payment } from "../models/index.js";
import { ApiError }    from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ── Helper: hours between two dates ─────────────────────────────────────────
const hoursBetween = (start, end) =>
  Math.max(0, (new Date(end) - new Date(start)) / 3_600_000);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/bookings     (renter, requireVerified)
// ─────────────────────────────────────────────────────────────────────────────
export const createBooking = asyncHandler(async (req, res) => {
  const {
    vehicleId, scheduledPickupAt, scheduledReturnAt,
    insuranceOpted,
    pickupLng, pickupLat, pickupStreet, pickupCity, pickupState, pickupPincode,
    deliveryLng, deliveryLat, deliveryStreet, deliveryCity, deliveryState, deliveryPincode,
  } = req.body;

  if (!vehicleId || !scheduledPickupAt || !scheduledReturnAt) {
    throw new ApiError(400, "vehicleId, scheduledPickupAt and scheduledReturnAt are required");
  }

  const pickup = new Date(scheduledPickupAt);
  const returnDate = new Date(scheduledReturnAt);
  if (pickup >= returnDate) throw new ApiError(400, "Return time must be after pickup time");
  if (pickup < new Date()) throw new ApiError(400, "Pickup time cannot be in the past");

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw new ApiError(404, "Vehicle not found");
  if (vehicle.status !== "available") throw new ApiError(400, "Vehicle is not available");
  if (vehicle.owner.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot book your own vehicle");
  }

  // Overlap check
  const overlap = await Booking.findOne({
    vehicle: vehicleId,
    status: { $in: ["pending", "confirmed", "active"] },
    $or: [
      { scheduledPickupAt: { $lt: returnDate }, scheduledReturnAt: { $gt: pickup } },
    ],
  });
  if (overlap) throw new ApiError(409, "Vehicle is already booked for this time slot");

  const estimatedHours = hoursBetween(pickup, returnDate);
  const insuranceFee = insuranceOpted === "true" && vehicle.insuranceAvailable
    ? vehicle.insuranceFeePerHour * estimatedHours
    : 0;

  const booking = await Booking.create({
    renter: req.user._id,
    vehicle: vehicleId,
    owner: vehicle.owner,
    scheduledPickupAt: pickup,
    scheduledReturnAt: returnDate,
    pickupLocation: {
      coordinates: [Number(pickupLng), Number(pickupLat)],
      address: { street: pickupStreet, city: pickupCity, state: pickupState, pincode: pickupPincode },
    },
    ...(deliveryLng && {
      deliveryLocation: {
        coordinates: [Number(deliveryLng), Number(deliveryLat)],
        address: { street: deliveryStreet, city: deliveryCity, state: deliveryState, pincode: deliveryPincode },
      },
    }),
    ratePerHour: vehicle.ratePerHour,
    estimatedHours,
    insuranceOpted: insuranceOpted === "true",
    insuranceFeePerHour: vehicle.insuranceFeePerHour,
  });

  return res.status(201).json(new ApiResponse(201, booking, "Booking request sent to owner"));
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/bookings/:id/confirm   (owner)
// ─────────────────────────────────────────────────────────────────────────────
export const confirmBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only the vehicle owner can confirm this booking");
  }
  if (booking.status !== "pending") {
    throw new ApiError(400, `Booking is already ${booking.status}`);
  }

  booking.status = "confirmed";
  await booking.save();

  // Lock the vehicle
  await Vehicle.findByIdAndUpdate(booking.vehicle, { status: "booked" });

  return res.status(200).json(new ApiResponse(200, booking, "Booking confirmed"));
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/bookings/:id/pickup    (owner — hand over vehicle)
// ─────────────────────────────────────────────────────────────────────────────
export const markPickup = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only the vehicle owner can mark pickup");
  }
  if (booking.status !== "confirmed") {
    throw new ApiError(400, "Booking must be confirmed before pickup");
  }

  booking.status = "active";
  booking.actualPickupAt = new Date();
  await booking.save();

  return res.status(200).json(new ApiResponse(200, booking, "Vehicle handed over — booking active"));
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/bookings/:id/return    (owner — vehicle returned, create Payment)
// Body: { damageFee? }
// ─────────────────────────────────────────────────────────────────────────────
export const markReturn = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only the vehicle owner can mark return");
  }
  if (booking.status !== "active") {
    throw new ApiError(400, "Booking must be active to mark return");
  }

  const now = new Date();
  const hoursUsed = hoursBetween(booking.actualPickupAt, now);
  const damageFee = Number(req.body.damageFee || 0);
  const insuranceFee = booking.insuranceOpted
    ? booking.insuranceFeePerHour * hoursUsed
    : 0;

  const fareBreakdown = Payment.calculateFare({
    ratePerHour: booking.ratePerHour,
    hoursUsed,
    insuranceFee,
    damageFee,
  });

  const payment = await Payment.create({
    booking:  booking._id,
    paidBy:   booking.renter,
    paidTo:   booking.owner,
    ratePerHour: booking.ratePerHour,
    hoursUsed,
    gateway: req.body.gateway || "razorpay",
    ...fareBreakdown,
  });

  booking.status = "completed";
  booking.actualReturnAt = now;
  booking.payment = payment._id;
  await booking.save();

  // Free up the vehicle
  await Vehicle.findByIdAndUpdate(booking.vehicle, {
    status: "available",
    $inc: { totalTrips: 1 },
  });

  return res.status(200).json(
    new ApiResponse(200, { booking, payment }, "Vehicle returned — payment record created")
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/bookings/:id/cancel   (renter or owner)
// Body: { reason? }
// ─────────────────────────────────────────────────────────────────────────────
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, "Booking not found");

  const isRenter = booking.renter.toString() === req.user._id.toString();
  const isOwner  = booking.owner.toString()  === req.user._id.toString();
  if (!isRenter && !isOwner) throw new ApiError(403, "Not authorised to cancel this booking");

  if (["completed", "cancelled"].includes(booking.status)) {
    throw new ApiError(400, `Cannot cancel a ${booking.status} booking`);
  }
  if (booking.status === "active") {
    throw new ApiError(400, "Cannot cancel an active booking — use return flow");
  }

  booking.status = "cancelled";
  booking.cancellationReason = req.body.reason || "";
  await booking.save();

  await Vehicle.findByIdAndUpdate(booking.vehicle, { status: "available" });

  return res.status(200).json(new ApiResponse(200, booking, "Booking cancelled"));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/bookings/my-bookings   (renter)
// ─────────────────────────────────────────────────────────────────────────────
export const getMyBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { renter: req.user._id };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate("vehicle", "make model images ratePerHour category")
      .populate("owner", "fullName avatar phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Booking.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, { bookings, pagination: { total, page: Number(page), limit: Number(limit) } },
      "Your bookings fetched")
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/bookings/owner-bookings   (owner)
// ─────────────────────────────────────────────────────────────────────────────
export const getOwnerBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { owner: req.user._id };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate("vehicle", "make model images ratePerHour")
      .populate("renter", "fullName avatar phone isVerified")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Booking.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, { bookings, pagination: { total, page: Number(page), limit: Number(limit) } },
      "Owner bookings fetched")
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/bookings/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("vehicle")
    .populate("renter", "fullName avatar phone")
    .populate("owner", "fullName avatar phone")
    .populate("payment");

  if (!booking) throw new ApiError(404, "Booking not found");

  const isParty =
    booking.renter._id.toString() === req.user._id.toString() ||
    booking.owner._id.toString()  === req.user._id.toString();
  if (!isParty) throw new ApiError(403, "Not authorised to view this booking");

  return res.status(200).json(new ApiResponse(200, booking, "Booking fetched"));
});
