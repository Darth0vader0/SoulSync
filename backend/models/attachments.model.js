const mongoose = require("mongoose");

const attachmentsSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    text: { type: String, default: "" },
    attachmentUrl: { type: String, default: "" }, // Store Cloudinary URL
    fileType: { type: String, enum: ["image", "mp3", "mp4", "pdf", "other"], default: "other" }, // File type
},
{ timestamps: true }
);

const attachments = mongoose.model("Attachments", attachmentsSchema);

module.exports = attachments;