const { Server } = require("socket.io");

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173/", // Allow frontend to connect
      methods: ["GET", "POST"],
      credentials : true
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join channel room
    socket.on("joinChannel", (channelId) => {
      socket.join(channelId);
      console.log(`User joined channel: ${channelId}`);
    });

    // Listen for messages and broadcast to the same channel
    socket.on("sendMessage", async (message) => {
      const { channelId, senderId,senderUsername, content } = message;

      // Save message to DB (optional)
      const newMessage = { senderId, channelId, content, senderUsername, timestamp: new Date() };
      io.to(channelId).emit("receiveMessage", newMessage);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

module.exports = setupSocket;
