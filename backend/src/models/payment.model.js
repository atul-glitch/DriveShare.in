import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    paidBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paidTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Fare breakdown ────────────────────────────────────────────────────
    ratePerHour: {
      type: Number,
      required: true,
      default: 120,
    },
    hoursUsed: {
      type: Number,
      required: true,
      min: [0, "Hours cannot be negative"],
    },
    baseFare: {
      type: Number,
      required: true, // ratePerHour × hoursUsed
    },
    insuranceFee: {
      type: Number,
      default: 0,
    },
    damageFee: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true, // baseFare + insuranceFee + damageFee
    },

    // ── Gateway ───────────────────────────────────────────────────────────
    currency: { type: String, default: "INR" },
    gateway: {
      type: String,
      enum: ["razorpay", "stripe", "upi", "cash"],
      required: true,
    },
    gatewayOrderId: { type: String, default: "" },
    gatewayPaymentId: { type: String, default: "" },
    gatewaySignature: { type: String, default: "" },

    // ── Status ────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "paid", "refunded", "failed"],
      default: "pending",
    },
    paidAt: { type: Date },
    refundedAt: { type: Date },
    refundAmount: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
paymentSchema.index({ paidBy: 1 });
paymentSchema.index({ status: 1 });

// ── Static: calculate fare ────────────────────────────────────────────────
/**
 * calculateFare({ ratePerHour, hoursUsed, insuranceFee, damageFee })
 * Formula: baseFare = ratePerHour × hoursUsed
 *          total    = baseFare + insuranceFee + damageFee
 */
paymentSchema.statics.calculateFare = function ({
  ratePerHour = 120,
  hoursUsed = 0,
  insuranceFee = 0,
  damageFee = 0,
}) {
  const baseFare = parseFloat((ratePerHour * hoursUsed).toFixed(2));
  const totalAmount = parseFloat(
    (baseFare + insuranceFee + damageFee).toFixed(2)
  );
  return { baseFare, insuranceFee, damageFee, totalAmount };
};

export const Payment = mongoose.model("Payment", paymentSchema);
