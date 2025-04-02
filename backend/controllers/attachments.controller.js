const attachments = require("../models/attachments.model");

// ✅ Send a Message (Text or File)
const sendAttachments = async (req, res) => {
    try {
        const { sender, chatId, text } = req.body;
        console.log("Request Body:", req.body); // Debugging
        console.log("File:", req.file); // Debugging
        const fileUrl = req.file ? req.file.path : ""; // Cloudinary File URL

        const newMessage = new attachments({
            sender,
            chatId,
            text,
            fileUrl, // Store any file URL
        });

        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Error sending message" });
    }
};

// ✅ Get All Messages for a Channel
const getAttachments = async (req, res) => {
    try {
        const messages = await attachments.find({ channelId: req.params.channelId })
            .sort({ createdAt: 1 })
            .populate("senderId", "username");

        res.json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


module.exports = {sendAttachments, getAttachments};