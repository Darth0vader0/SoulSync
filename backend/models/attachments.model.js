const mongoose = require("mongoose");

const attachmentsSchema = new mongoose.Schema( {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    text: { type: String, default: "" },
    imageUrl: { type: String, default: "" }, // Store Cloudinary URL
},
{ timestamps: true }
);


const attachments= mongoose.model("Attachments", attachmentsSchema);

module.exports = attachments;
