const usersInChannels = {}; // Store users per channel

const setupVoiceSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔊 User connected for voice: ${socket.id}`);

    // Join voice channel
    socket.on("joinVoiceChannel", (channelId, user) => {
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

    //handle leave user list
    // 🔹 User leaves voice channel
    socket.on("leaveVoiceChannel", (channelId, user) => {
      console.log(`User ${user.username} leaving channel ${channelId}`);

      // ✅ Remove user from backend list
      if (usersInChannels[channelId]) {
        usersInChannels[channelId] = usersInChannels[channelId].filter(u => u.id !== user._id);
      }

      console.log(`Updated users in ${channelId}:`, usersInChannels[channelId]);

      // ✅ Emit the updated user list to **all users in the channel**
      io.to(channelId).emit("userList", usersInChannels[channelId] || []);
      socket.leave(channelId);
    });

    socket.on("offer", ({ channelId, offer, sender }) => {
      console.log(`📡 Offer from ${sender} in channel ${channelId}`);
      socket.to(channelId).emit("offer", { offer, sender });
    });

    // 🔹 Handle WebRTC answers
    socket.on("answer", ({ channelId, answer, sender }) => {
      console.log(`✅ Answer from ${sender} in channel ${channelId}`);
      socket.to(channelId).emit("answer", { answer, sender });
    });

    // 🔹 Handle ICE candidates (for peer connection)
    socket.on("iceCandidate", ({ channelId, candidate, sender }) => {
      console.log(`🌐 ICE Candidate from ${sender} in channel ${channelId}`);
      socket.to(channelId).emit("iceCandidate", { candidate, sender });
    });
    //mute unmute
    socket.on("toggleMute", ({ userId, isMuted, channelId }) => {
      console.log(`🔇 User ${userId.username} ${isMuted ? "muted" : "unmuted"}`);
      
      // Update the user's mute state in the server list
      if (usersInChannels[channelId]) {
        usersInChannels[channelId] = usersInChannels[channelId].map(user =>
          user.id === userId ? { ...user, isMuted } : user
        );
    
        // Notify all users in the channel
        io.to(channelId).emit("userMuted", { userId, isMuted });
      }
    });
    
    // Disconnecting
    socket.on("disconnect", () => {
      console.log(`❌ Voice user disconnected: ${socket.id}`);

      // Find and remove the user from all channels
      Object.keys(usersInChannels).forEach((channelId) => {
        usersInChannels[channelId] = usersInChannels[channelId].filter(u => u.socketId !== socket.id);

        // If no users left in the channel, delete it
        if (usersInChannels[channelId].length === 0) {
          delete usersInChannels[channelId];
        }

        // Notify remaining users in the channel
        io.to(channelId).emit("userList", usersInChannels[channelId] || []);
      });
    })
  });
};

module.exports = setupVoiceSocket;
