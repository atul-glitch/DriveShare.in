import { Message, Booking } from "../models/index.js";
import { ApiError }    from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// ── Guard: user must be renter or owner of the booking ──────────────────────
const assertParty = (booking, userId) => {
  const isParty =
    booking.renter.toString() === userId.toString() ||
    booking.owner.toString()  === userId.toString();
  if (!isParty) throw new ApiError(403, "You are not a party to this booking");
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/messages
// Body (multipart/form-data): bookingId, messageType (text|image), content (if text)
// File: image (if messageType === "image")
// ─────────────────────────────────────────────────────────────────────────────
export const sendMessage = asyncHandler(async (req, res) => {
  const { bookingId, messageType = "text", content } = req.body;
  if (!bookingId) throw new ApiError(400, "bookingId is required");

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");
  assertParty(booking, req.user._id);

  if (["cancelled", "completed"].includes(booking.status)) {
    throw new ApiError(400, "Cannot send messages for a closed booking");
  }

  // Determine receiver (the other party)
  const receiver =
    booking.renter.toString() === req.user._id.toString()
      ? booking.owner
      : booking.renter;

  let finalContent = content;

  if (messageType === "image") {
    const filePath = req.file?.path;
    if (!filePath) throw new ApiError(400, "Image file is required for image message");
    const uploaded = await uploadOnCloudinary(filePath, "messages");
    if (!uploaded) throw new ApiError(500, "Image upload failed");
    finalContent = uploaded.secure_url;
  } else {
    if (!content?.trim()) throw new ApiError(400, "Content is required for text messages");
  }

  const message = await Message.create({
    booking:  bookingId,
    sender:   req.user._id,
    receiver,
    messageType,
    content: finalContent,
  });

  return res.status(201).json(new ApiResponse(201, message, "Message sent"));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/messages/:bookingId?page=1&limit=20
// ─────────────────────────────────────────────────────────────────────────────
export const getMessages = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");
  assertParty(booking, req.user._id);

  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [messages, total] = await Promise.all([
    Message.find({ booking: req.params.bookingId, isDeleted: false })
      .populate("sender", "fullName avatar")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(Number(limit)),
    Message.countDocuments({ booking: req.params.bookingId, isDeleted: false }),
  ]);

  // Mark incoming messages as read
  await Message.updateMany(
    { booking: req.params.bookingId, receiver: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  return res.status(200).json(
    new ApiResponse(200, { messages, pagination: { total, page: Number(page), limit: Number(limit) } },
      "Messages fetched")
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/messages/:id   (sender only, soft delete)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) throw new ApiError(404, "Message not found");
  if (message.sender.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own messages");
  }

  message.isDeleted = true;
  await message.save();

  return res.status(200).json(new ApiResponse(200, {}, "Message deleted"));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/messages/unread-count
// ─────────────────────────────────────────────────────────────────────────────
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Message.countDocuments({
    receiver: req.user._id,
    isRead: false,
    isDeleted: false,
  });
  return res.status(200).json(new ApiResponse(200, { unreadCount: count }, "Unread count"));
});
