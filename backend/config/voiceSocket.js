const usersInChannels = {}; // Store users per channel
const setupVoiceSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔊 User connected for voice: ${socket.id}`);

    // Join voice channel
    socket.on("joinVoiceChannel",  (channelId, user ) => {
      socket.join(channelId);
      console.log(`User ${user.username} joined voice channel ${channelId}`);

      const newUser = {
        username: user.username,
        id: user._id,
        joinChannel: channelId,
      };

      // 🔹 Initialize channel if not present
      if (!usersInChannels[channelId]) {
        usersInChannels[channelId] = [];
      }

      // 🔹 Prevent duplicate users
      if (!usersInChannels[channelId].some(u => u.id === user._id)) {
        usersInChannels[channelId].push(newUser);
      }

      console.log(`Updated users in ${channelId}:`, usersInChannels[channelId]);

      // 🔹 Emit updated user list to all clients in channel
      io.to(channelId).emit("userList", usersInChannels[channelId]);
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
    socket.on("leaveVoiceChannel", (channelId,user) => {
      socket.leave(channelId);
      socket.to(channelId).emit("userLeft", { userId: user });
    });

    // Disconnecting
    socket.on("disconnect", (user) => {
      console.log(`❌ Voice user ${user._id} disconnected`);
    });
  });
};

module.exports = setupVoiceSocket;
