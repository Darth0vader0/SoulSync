const mongoose = require("mongoose");
const { Schema } = mongoose;

const MessageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null }
  },
  { timestamps: true }
);

const gcMessageSchema = new Schema({
  channelId: {
    type: Schema.Types.ObjectId,
    ref: "Channel", // Links message to a specific channel
    required: true,
  }, 
  senderUsername: {
    type: String,
    required: true, // Ensure every message has the sender's username
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "User", // Links message to the sender
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  messageType: {
    type: String,
    enum: ["text", "image", "audio", "video"],
    default: "text",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const GcMessages = mongoose.model("groupMessages",gcMessageSchema)

const Message = mongoose.model("Message", MessageSchema);
module.exports = {Message,GcMessages};
