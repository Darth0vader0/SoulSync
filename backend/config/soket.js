const { Server } = require("socket.io");

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://192.168.242.210:5173"], // Allow frontend to connect
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  const chatNamespace = io.of("/chat"); // Use namespace for messaging

  chatNamespace.on("connection", (socket) => {
    console.log(`💬 User connected to chat: ${socket.id}`);

    // Joining a channel room
    socket.on("joinChannel", (channelId) => {
      socket.join(channelId);
      console.log(`User ${socket.id} joined channel: ${channelId}`);
    });

    // Listen for messages and broadcast to the same channel
    socket.on("sendMessage", async (message, callback) => {
      const { channelId, senderId, senderUsername, content } = message;

      if (!channelId || !senderId || !content) {
        return console.log("⚠️ Invalid message data:", message);
      }

      // Create a message object
      const newMessage = {
        senderId,
        senderUsername,
        channelId,
        content,
        timestamp: new Date()
      };

      console.log(`📩 New message in channel ${channelId}:`, newMessage);

      // Emit to all users in the channel
      chatNamespace.to(channelId).emit("receiveMessage", newMessage);

      // Acknowledge message sent
      if (callback) callback({ status: "ok" });
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log(`❌ Chat user ${socket.id} disconnected`);
    });
  });

  return io;
};

module.exports = setupSocket;
