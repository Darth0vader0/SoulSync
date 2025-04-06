const attachments = require("../models/attachments.model");

// ✅ Send a Message (Text or File)
const path = require("path"); // Import path module for file extension handling

const sendAttachments = async (req, res) => {
    try {
        const { sender, chatId, text } = req.body;

        const fileUrl = req.file ? req.file.path : ""; // Cloudinary File URL
        let fileType = "other"; // Default file type

        if (req.file) {
            const ext = path.extname(req.file.originalname).toLowerCase(); // Get file extension
            if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext)) {
                fileType = "image";
            } else if ([".mp3"].includes(ext)) {
                fileType = "mp3";
            } else if ([".mp4"].includes(ext)) {
                fileType = "mp4";
            } else if ([".pdf"].includes(ext)) {
                fileType = "pdf";
            }
        }

        const newMessage = new attachments({
            sender,
            chatId,
            text,
            attachmentUrl: fileUrl, // Store any file URL
            fileType, // Set the determined file type
        });

        const savedMessage = await newMessage.save();
        const io = req.app.get("io"); // Get the io instance from the app
        io.to(chatId).emit("messageReceived", savedMessage); // Emit the message to the channel
        res.status(201).json(savedMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Error sending message" });
    }
};

// ✅ Get All Messages for a Channel
const getAttachments = async (req, res) => { 
    try {
        // Fetch messages for the given channelId
        const messages = await attachments.find({ chatId: req.query.channelId })
            .sort({ createdAt: 1 })
            .populate("sender", "username"); // Correct field name for population

        res.json({ success: true, messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};


module.exports = {sendAttachments, getAttachments};