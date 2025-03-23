const usersInChannels = new Map(); // { channelId: Map(userId -> userInfo) }
const userChannelMap = new Map(); // { userId -> channelId }
const socketUserMap = new Map(); // { socketId -> userId }

const setupVoiceSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔊 User connected for voice: ${socket.id}`);

    // 🎤 User joins a voice channel
    socket.on("joinVoiceChannel", ({ channelId, user }) => {
      // Store socket to user mapping
      socketUserMap.set(socket.id, user._id);
      
      // If user is already in a channel, remove them from the previous one
      if (userChannelMap.has(user._id)) {
        const prevChannel = userChannelMap.get(user._id);
        removeUserFromChannel(io, prevChannel, user._id, socket.id);
      }

      socket.join(channelId);
      userChannelMap.set(user._id, channelId);

      if (!usersInChannels.has(channelId)) {
        usersInChannels.set(channelId, new Map());
      }

      // Add user to the channel
      usersInChannels.get(channelId).set(user._id, { 
        username: user.username, 
        id: user._id,
        socketId: socket.id  // Store socket ID with user info
      });

      // Get existing users in the channel for new peer connections
      const existingUsers = Array.from(usersInChannels.get(channelId).values())
        .filter(u => u.id !== user._id);
      
      // Notify the new user about existing users to initiate connections
      socket.emit("existingUsers", existingUsers);
      
      // Notify existing users about the new user
      socket.to(channelId).emit("newUserJoined", {
        username: user.username,
        id: user._id,
        socketId: socket.id
      });

      updateUserList(io, channelId);
    });

    // 🎤 User manually disconnects from voice
    socket.on("leaveVoiceChannel", ({ user }) => {
      if (userChannelMap.has(user._id)) {
        const channelId = userChannelMap.get(user._id);
        removeUserFromChannel(io, channelId, user._id, socket.id);
      }
    });

    // WebRTC Signaling: Offer
    socket.on("webrtc-offer", ({ target, offer, from }) => {
      // Forward the offer to the target peer
      io.to(target).emit("webrtc-offer", {
        offer,
        from: socket.id
      });
    });

    // WebRTC Signaling: Answer
    socket.on("webrtc-answer", ({ target, answer }) => {
      // Forward the answer to the target peer
      io.to(target).emit("webrtc-answer", {
        answer,
        from: socket.id
      });
    });

    // WebRTC Signaling: ICE Candidate
    socket.on("webrtc-ice-candidate", ({ target, candidate }) => {
      // Forward the ICE candidate to the target peer
      io.to(target).emit("webrtc-ice-candidate", {
        candidate,
        from: socket.id
      });
    });

    // WebRTC Mute/Unmute status change
    socket.on("audio-status-change", ({ isMuted }) => {
      const userId = socketUserMap.get(socket.id);
      if (userId && userChannelMap.has(userId)) {
        const channelId = userChannelMap.get(userId);
        if (usersInChannels.has(channelId) && 
            usersInChannels.get(channelId).has(userId)) {
          
          // Update user's mute status
          const userInfo = usersInChannels.get(channelId).get(userId);
          userInfo.isMuted = isMuted;
          usersInChannels.get(channelId).set(userId, userInfo);
          
          // Notify all users in the channel about status change
          io.to(channelId).emit("user-audio-status", {
            userId,
            isMuted
          });
        }
      }
    });

    // ❌ Handle user disconnection (closing tab, refreshing, etc.)
    socket.on("disconnect", () => {
      console.log(`❌ Voice user disconnected: ${socket.id}`);
      
      const userId = socketUserMap.get(socket.id);
      if (userId && userChannelMap.has(userId)) {
        const channelId = userChannelMap.get(userId);
        removeUserFromChannel(io, channelId, userId, socket.id);
      }
      
      socketUserMap.delete(socket.id);
    });
  });
};

// 📢 Function to remove user from a channel and notify others
const removeUserFromChannel = (io, channelId, userId, socketId) => {
  if (usersInChannels.has(channelId)) {
    usersInChannels.get(channelId).delete(userId);
    
    if (usersInChannels.get(channelId).size === 0) {
      usersInChannels.delete(channelId);
    } else {
      // Notify other users that this user has left
      io.to(channelId).emit("userLeft", { userId, socketId });
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