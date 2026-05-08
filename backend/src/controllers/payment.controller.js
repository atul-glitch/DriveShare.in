import crypto from "crypto";
import { Payment, Booking } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const requireBookingParty = async (req, renterOnly = false) => {
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  const userId = req.user._id.toString();
  const isRenter = booking.renter.toString() === userId;
  const isOwner = booking.owner.toString() === userId;

  if (renterOnly && !isRenter) {
    throw new ApiError(403, "Only the renter can complete this payment action");
  }
  if (!renterOnly && !isRenter && !isOwner) {
    throw new ApiError(403, "Not authorised for this payment");
  }

  return booking;
};

const createRazorpayOrder = async (payment) => {
  const auth = Buffer
    .from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`)
    .toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(payment.totalAmount * 100),
      currency: payment.currency || "INR",
      receipt: payment._id.toString(),
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.id) {
    throw new Error(payload?.error?.description || "Unable to create Razorpay order");
  }

  return payload.id;
};

const isPlaceholderOrderId = (value = "") => /^order_[a-f0-9]{32}$/i.test(value);

// POST /api/v1/payments/:bookingId/initiate
// Creates Razorpay order or returns development fallback details.
export const initiatePayment = asyncHandler(async (req, res) => {
  await requireBookingParty(req, true);

  const payment = await Payment.findOne({ booking: req.params.bookingId });
  if (!payment) throw new ApiError(404, "Payment record not found - complete the return flow first");
  if (payment.status === "paid") throw new ApiError(400, "Already paid");

  const hasRazorpayCredentials =
    Boolean(process.env.RAZORPAY_KEY_ID) &&
    Boolean(process.env.RAZORPAY_KEY_SECRET);

  let createdOrderId = null;
  if (hasRazorpayCredentials && (!payment.gatewayOrderId || isPlaceholderOrderId(payment.gatewayOrderId))) {
    try {
      createdOrderId = await createRazorpayOrder(payment);
      payment.gatewayOrderId = createdOrderId;
      await payment.save();
    } catch (error) {
      if (process.env.NODE_ENV === "production") {
        throw new ApiError(502, "Unable to create Razorpay order right now");
      }
      console.warn(
        "Razorpay order creation failed, using development fallback:",
        error?.message || error
      );
    }
  }

  if (!payment.gatewayOrderId) {
    payment.gatewayOrderId = `order_${crypto.randomUUID().replace(/-/g, "")}`;
    await payment.save();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        paymentId: payment._id,
        gatewayOrderId: payment.gatewayOrderId,
        totalAmount: payment.totalAmount,
        currency: payment.currency,
        breakdown: {
          baseFare: payment.baseFare,
          insuranceFee: payment.insuranceFee,
          damageFee: payment.damageFee,
        },
        createdGatewayOrderId: createdOrderId,
      },
      "Payment details fetched - proceed with gateway"
    )
  );
});

// POST /api/v1/payments/:bookingId/verify
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
export const verifyPayment = asyncHandler(async (req, res) => {
  await requireBookingParty(req, true);

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Razorpay verification payload is incomplete");
  }
  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new ApiError(500, "Razorpay is not configured on the server");
  }

  const payment = await Payment.findOne({ booking: req.params.bookingId });
  if (!payment) throw new ApiError(404, "Payment record not found");
  if (payment.status === "paid") throw new ApiError(400, "Already paid");
  if (payment.gatewayOrderId !== razorpay_order_id) {
    throw new ApiError(400, "Payment order mismatch");
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expected !== razorpay_signature) {
    throw new ApiError(400, "Payment signature verification failed");
  }

  payment.gatewayPaymentId = razorpay_payment_id;
  payment.gatewaySignature = razorpay_signature;
  payment.status = "paid";
  payment.paidAt = new Date();
  await payment.save();

  return res.status(200).json(new ApiResponse(200, payment, "Payment verified successfully"));
});

// GET /api/v1/payments/:bookingId
export const getPaymentByBooking = asyncHandler(async (req, res) => {
  await requireBookingParty(req, false);

  const payment = await Payment.findOne({ booking: req.params.bookingId })
    .populate("paidBy", "fullName email")
    .populate("paidTo", "fullName email");

  if (!payment) throw new ApiError(404, "No payment found for this booking");

  return res.status(200).json(new ApiResponse(200, payment, "Payment fetched"));
});

// GET /api/v1/payments/my-earnings
export const getMyEarnings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [payments, total, aggregate] = await Promise.all([
    Payment.find({ paidTo: req.user._id, status: "paid" })
      .populate("booking", "scheduledPickupAt scheduledReturnAt")
      .populate("paidBy", "fullName")
      .sort({ paidAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Payment.countDocuments({ paidTo: req.user._id, status: "paid" }),
    Payment.aggregate([
      { $match: { paidTo: req.user._id, status: "paid" } },
      { $group: { _id: null, totalEarnings: { $sum: "$totalAmount" } } },
    ]),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        payments,
        totalEarnings: aggregate[0]?.totalEarnings || 0,
        pagination: { total, page: Number(page), limit: Number(limit) },
      },
      "Earnings fetched"
    )
  );
});

// POST /api/v1/payments/:bookingId/mock-verify
// Development helper: mark a payment as paid without gateway verification.
export const mockVerifyPayment = asyncHandler(async (req, res) => {
  await requireBookingParty(req, true);

  if (process.env.NODE_ENV === "production" && process.env.ALLOW_MOCK_PAY !== "true") {
    throw new ApiError(403, "Mock payment is disabled in production");
  }

  const payment = await Payment.findOne({ booking: req.params.bookingId });
  if (!payment) throw new ApiError(404, "Payment record not found");
  if (payment.status === "paid") throw new ApiError(400, "Already paid");

  payment.gatewayPaymentId = `mock_pay_${crypto.randomUUID().slice(0, 8)}`;
  payment.gatewaySignature = `mock_sig_${crypto.randomUUID().slice(0, 8)}`;
  payment.status = "paid";
  payment.paidAt = new Date();
  await payment.save();

  return res.status(200).json(new ApiResponse(200, payment, "Mock payment applied"));
});
