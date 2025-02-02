const Message = require("../models/message.model");

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    await newMessage.save();
    res.status(201).json({ success: true, message: "Message sent successfully", data: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Get messages between two users
const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

module.exports = { sendMessage, getMessages };