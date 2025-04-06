const usersInChannels = new Map(); // { channelId: Map(userId -> userInfo) }
const userChannelMap = new Map(); // { userId -> channelId }
const socketUserMap = new Map(); // { socketId -> userId }

const setupVoiceSocket = (io) => {
  io.on("connection", (socket) => {

    //  User joins a voice channel
    socket.on("joinVoiceChannel", ({ channelId, user }) => {
      socketUserMap.set(socket.id, user._id);

      if (userChannelMap.has(user._id)) {
        const prevChannel = userChannelMap.get(user._id);
        removeUserFromChannel(io, prevChannel, user._id, socket.id);
      }

      socket.join(channelId);
      userChannelMap.set(user._id, channelId);

      if (!usersInChannels.has(channelId)) {
        usersInChannels.set(channelId, new Map());
      }

      usersInChannels.get(channelId).set(user._id, {
        username: user.username,
        id: user._id,
        socketId: socket.id,
        isMuted: false,
        isDeafened: false,
      });

      updateUserList(io, channelId);
    });

    // Handle WebRTC offer
    socket.on("offer", ({ offer, channelId, senderId }) => {
      socket.to(channelId).emit("offer", { offer, senderId });
    });

    // Handle WebRTC answer
    socket.on("answer", ({ answer, channelId, receiverId }) => {
      socket.to(channelId).emit("answer", { answer, receiverId });
    });

    // Handle ICE candidate
    socket.on("ice-candidate", ({ candidate, channelId }) => {
      socket.to(channelId).emit("ice-candidate", { candidate });
    });

    // User manually disconnects from voice
    socket.on("leaveVoiceChannel", ({ user }) => {
      if (userChannelMap.has(user._id)) {
        const channelId = userChannelMap.get(user._id);
        removeUserFromChannel(io, channelId, user._id, socket.id);
      }
    });

    //  Handle mute/unmute status change
    socket.on("audio-status-change", ({ isMuted }) => {
      const userId = socketUserMap.get(socket.id);
      if (userId && userChannelMap.has(userId)) {
        const channelId = userChannelMap.get(userId);
        if (usersInChannels.has(channelId) && usersInChannels.get(channelId).has(userId)) {
          const userInfo = usersInChannels.get(channelId).get(userId);
          userInfo.isMuted = isMuted;
          usersInChannels.get(channelId).set(userId, userInfo);

          io.to(channelId).emit("user-audio-status", { userId, isMuted });
        }
      }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {

      const userId = socketUserMap.get(socket.id);
      if (userId && userChannelMap.has(userId)) {
        const channelId = userChannelMap.get(userId);
        removeUserFromChannel(io, channelId, userId, socket.id);
      }

      socketUserMap.delete(socket.id);
    });
  });
};

const removeUserFromChannel = (io, channelId, userId, socketId) => {
  if (usersInChannels.has(channelId)) {
    usersInChannels.get(channelId).delete(userId);

    if (usersInChannels.get(channelId).size === 0) {
      usersInChannels.delete(channelId);
    } else {
      io.to(channelId).emit("userLeft", { userId, socketId });
    }

    userChannelMap.delete(userId);
    updateUserList(io, channelId);
  }
};

const updateUserList = (io, channelId) => {
  if (usersInChannels.has(channelId)) {
    const userList = Array.from(usersInChannels.get(channelId).values());
    io.to(channelId).emit("userList", userList);
    console.log(`🔄 Updated users in channel ${channelId}:`, userList);
  }
};

module.exports = setupVoiceSocket;