import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking context is required"],
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver is required"],
    },

    // ── Abstract message type ────────────────────────────────────────────
    messageType: {
      type: String,
      enum: ["text", "image"],
      default: "text",
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    // for messageType === "image", content holds the Cloudinary URL
    // for messageType === "text",  content holds the plain text

    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
messageSchema.index({ booking: 1, createdAt: 1 }); // chat thread order
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, isRead: 1 }); // unread count queries

export const Message = mongoose.model("Message", messageSchema);
