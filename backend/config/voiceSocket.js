const setupVoiceSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔊 User connected for voice: ${socket.id}`);

    // Join voice channel
    socket.on("joinVoiceChannel", (channelId) => {
      socket.join(channelId);
      console.log(`User ${socket.id} joined voice channel ${channelId}`);
      socket.to(channelId).emit("userJoined", { userId: socket.id });
    });

    // Handle WebRTC offers
    socket.on("offer", (data) => {
      const { channelId, offer, sender } = data;
      socket.to(channelId).emit("offer", { offer, sender });
    });

    // Handle WebRTC answers
    socket.on("answer", (data) => {
      const { channelId, answer, sender } = data;
      socket.to(channelId).emit("answer", { answer, sender });
    });

    // Handle ICE candidates
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
      console.log(`❌ Voice user ${socket.id} disconnected`);
    });
  });
};

module.exports = setupVoiceSocket;
