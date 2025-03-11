const {Message,GcMessages} = require("../models/message.model");
const jwt =require('jsonwebtoken');

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

// Get all messages from a channel

const getChannelMessages = async (req, res) => {
  
  try {
    const channelId = req.query.channelId;

    const messages = await GcMessages.find({ channelId }).sort({ timestamp: 1 });
    console.log(messages);
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

//send message to server channel

const sendMessageToChannel = async (req, res) => {
  try {
    const { channelId, content } = req.body;

     
    const newMessage = new GcMessages({
      senderId: req.user.userId,
      senderUsername: req.user.username,
      channelId,
      content,
    });
    await newMessage.save();
    res.status(201).json({ success: true, message: "Message sent successfully", data: newMessage });
  } catch (error) {
    console.log(error.message);

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

module.exports = { sendMessage, getMessages ,sendMessageToChannel,getChannelMessages};