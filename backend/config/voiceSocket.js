const { Server } = require("socket.io");

const setupVoiceSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://192.168.242.210:5173"], // Adjust based on deployment
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected to voice channel:", socket.id);

    // Joining a voice channel
    socket.on("joinVoiceChannel", (channelId) => {
      socket.join(channelId);
      console.log(`User ${socket.id} joined voice channel ${channelId}`);
      socket.to(channelId).emit("userJoined", { userId: socket.id });
    });

    // Handling WebRTC offers
    socket.on("offer", (data) => {
      const { channelId, offer, sender } = data;
      socket.to(channelId).emit("offer", { offer, sender });
    });

    // Handling WebRTC answers
    socket.on("answer", (data) => {
      const { channelId, answer, sender } = data;
      socket.to(channelId).emit("answer", { answer, sender });
    });

    // Handling ICE candidates
    socket.on("iceCandidate", (data) => {
      const { channelId, candidate, sender } = data;
      socket.to(channelId).emit("iceCandidate", { candidate, sender });
    });

    // Leaving voice channel
    socket.on("leaveVoiceChannel", (channelId) => {
      socket.leave(channelId);
      socket.to(channelId).emit("userLeft", { userId: socket.id });
    });

    // Disconnecting
    socket.on("disconnect", () => {
      console.log(`User ${socket.id} disconnected`);
    });
  });

  return io;
};

module.exports = setupVoiceSocket;
