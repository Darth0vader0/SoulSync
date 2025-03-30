const usersInChannels = new Map(); // { channelId: Map(userId -> userInfo) }
const userChannelMap = new Map(); // { userId -> channelId }
const socketUserMap = new Map(); // { socketId -> userId }

const setupVoiceSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Handle user joining a channel
    socket.on("join-channel", ({ channelId, userId, userInfo }) => {
      if (!usersInChannels.has(channelId)) {
        usersInChannels.set(channelId, new Map());
      }
      usersInChannels.get(channelId).set(userId, userInfo);
      userChannelMap.set(userId, channelId);
      socketUserMap.set(socket.id, userId);

      socket.join(channelId);
      io.to(channelId).emit("user-joined", { userId, userInfo });
      console.log(`User ${userId} joined channel ${channelId}`);
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

    // Handle user leaving a channel
    socket.on("leave-channel", ({ channelId }) => {
      const userId = socketUserMap.get(socket.id);
      if (userId && usersInChannels.has(channelId)) {
        usersInChannels.get(channelId).delete(userId);
        userChannelMap.delete(userId);
        socketUserMap.delete(socket.id);

        socket.leave(channelId);
        io.to(channelId).emit("user-left", { userId });
      }
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
      const userId = socketUserMap.get(socket.id);
      if (userId) {
        const channelId = userChannelMap.get(userId);
        if (channelId && usersInChannels.has(channelId)) {
          usersInChannels.get(channelId).delete(userId);
          userChannelMap.delete(userId);
        }
        socketUserMap.delete(socket.id);

        if (channelId) {
          io.to(channelId).emit("user-left", { userId });
        }
      }
    });
  });
};

module.exports = setupVoiceSocket;