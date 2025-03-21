const usersInChannels = new Map(); // { channelId: Map(userId -> userInfo) }
const userChannelMap = new Map(); // { userId -> channelId }

const setupVoiceSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔊 User connected for voice: ${socket.id}`);

    // 🎤 User joins a voice channel
    socket.on("joinVoiceChannel", ({ channelId, user }) => {
      // If user is already in a channel, remove them from the previous one
      if (userChannelMap.has(user._id)) {
        const prevChannel = userChannelMap.get(user._id);
        removeUserFromChannel(io, prevChannel, user._id);
      }

      socket.join(channelId);
      userChannelMap.set(user._id, channelId);

      if (!usersInChannels.has(channelId)) {
        usersInChannels.set(channelId, new Map());
      }

      // Add user to the channel
      usersInChannels.get(channelId).set(user._id, { 
        username: user.username, 
        id: user._id 
      });

      updateUserList(io, channelId);
       // Notify other users to start WebRTC connection
      socket.to(channelId).emit("user-joined", { userId: user._id, username: user.username });
    });

    // 🎤 User manually disconnects from voice
    socket.on("leaveVoiceChannel", ({ user }) => {
      if (userChannelMap.has(user._id)) {
        const channelId = userChannelMap.get(user._id);
        removeUserFromChannel(io, channelId, user._id);
      }
    });
    socket.on("offer", ({ targetUserId, offer }) => {
      io.to(targetUserId).emit("offer", { senderId: socket.id, offer });
    });
    
    socket.on("answer", ({ targetUserId, answer }) => {
      io.to(targetUserId).emit("answer", { senderId: socket.id, answer });
    });
    
    socket.on("ice-candidate", ({ targetUserId, candidate }) => {
      io.to(targetUserId).emit("ice-candidate", { senderId: socket.id, candidate });
    });
    
    // ❌ Handle user disconnection (closing tab, refreshing, etc.)
    socket.on("disconnect", () => {
      console.log(`❌ Voice user disconnected: ${socket.id}`);
      
      userChannelMap.forEach((channelId, userId) => {
        removeUserFromChannel(io, channelId, userId);
      });
    });
  });
};

// 📢 Function to remove user from a channel and notify others
const removeUserFromChannel = (io, channelId, userId) => {
  if (usersInChannels.has(channelId)) {
    usersInChannels.get(channelId).delete(userId);
    
    if (usersInChannels.get(channelId).size === 0) {
      usersInChannels.delete(channelId);
    }
    
    userChannelMap.delete(userId);
    updateUserList(io, channelId);
  }
};

// 📢 Function to update user list in a channel
const updateUserList = (io, channelId) => {
  if (usersInChannels.has(channelId)) {
    const userList = Array.from(usersInChannels.get(channelId).values());
    io.to(channelId).emit("userList", userList);
    console.log(`🔄 Updated users in channel ${channelId}:`, userList);
  }
};

module.exports = setupVoiceSocket;
