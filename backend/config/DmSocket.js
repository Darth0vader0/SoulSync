const connectedUsersInDm = new Map();
const { Message } = require('../models/message.model')


const DmSocket = (io) => {
  io.on('connection', (socket) => {

    // Handle user connection
    socket.on('userConnectedToDm', (userId) => {
      connectedUsersInDm.set(userId, socket.id);
      socket.join(userId); // Ensure user can receive messages directed to their userId
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      for (const [userId, socketId] of connectedUsersInDm.entries()) {
        if (socketId === socket.id) {
          connectedUsersInDm.delete(userId);
          break;
        }
      }
    });

    // Handle joining a DM room (not needed since users now auto-join their own room)
    socket.on('joinDm', (receiverId) => {
      socket.join(receiverId);
    });
    // Handle sending a message
    socket.on('sendMessageInDm', async (messageData) => {
      try {
        const { senderId, receiverId, message } = messageData;

        // Save message in the database
        const newMessage = new Message({ senderId, receiverId, message });
        await newMessage.save();
        // Emit message to receiver's room
        io.to(receiverId).emit("receiveMessage", newMessage);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });
    // read messages
    socket.on("messageRead", async ({ messageId, senderId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, { read: true });
        io.to(senderId).emit("messageReadUpdate", { messageId });
      } catch (error) {
        console.error("Error updating read status:", error);
      }
    });
  });
};

module.exports = DmSocket;
