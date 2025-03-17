const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`💬 User connected for chat: ${socket.id}`);

    // Join channel room
    socket.on("joinChannel", (channelId) => {
      socket.join(channelId);
      console.log(`User ${socket.id} joined channel ${channelId}`);
    });

    // Listen for messages and broadcast them
    socket.on("sendMessage", async (message) => {
      const { channelId, senderId, senderUsername, content } = message;
      console.log(message);
      // Create message object
      const newMessage = {
        senderId,
        senderUsername,
        channelId,
        content,
        timestamp: new Date()
      };

      // Emit the message to everyone in the channel
      io.to(channelId).emit("receiveMessage", newMessage);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Chat user ${socket.id} disconnected`);
    });
  });
};

module.exports = setupSocket;