const onlineUsers = new Map(); // { userId: Set(serverIds) }
const onlineUsersPerServer = new Map(); // { serverId: Set(userIds) }

const setupSocket = (io) => {

    

  io.on("connection", (socket) => {
    console.log(`💬 User connected for chat: ${socket.id}`);
    // Add user to onlineUsers
    socket.on("userConnected", ({ userId, serverIds }) => {
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id); // Store each connection

      serverIds.forEach((serverId) => {
        socket.join(serverId);
        if (!onlineUsersPerServer.has(serverId)) {
          onlineUsersPerServer.set(serverId, new Set());
        }
        onlineUsersPerServer.get(serverId).add(userId);
        
        io.to(serverId).emit("updateOnlineUsers", Array.from(onlineUsersPerServer.get(serverId)));
      });

      console.log(`🔹 User ${userId} connected on socket ${socket.id}`);
    });

    
    

    // Join channel room
    socket.on("joinChannel", (channelId) => {
      socket.join(channelId);
      console.log(`User ${socket.id} joined channel ${channelId}`);
    });

    // Listen for messages and broadcast them
    socket.on("sendMessage", async (message) => {
      const { channelId, senderId, senderUsername, content } = message;
      // Create message object
      const newMessage = {
        senderId,
        senderUsername,
        channelId,
        content,
        timestamp: new Date()
      };

      // Emit the message to everyone in the channel
      io.to(channelId).emit("receiveMessage", newMessage);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Chat user ${socket.id} disconnected`);

      let disconnectedUserId = null;

      // Find the userId that owns this socket
      for (const [userId, sockets] of onlineUsers.entries()) {
        if (sockets.has(socket.id)) {
          disconnectedUserId = userId;
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            onlineUsers.delete(userId); // Only delete if no sockets left
          }
          break;
        }
      }

      if (!disconnectedUserId) return;

      const userServers = onlineUsers.get(disconnectedUserId) || new Set();

      userServers.forEach((serverId) => {
        if (onlineUsersPerServer.has(serverId)) {
          onlineUsersPerServer.get(serverId).delete(disconnectedUserId);
          if (onlineUsersPerServer.get(serverId).size === 0) {
            onlineUsersPerServer.delete(serverId);
          } else {
            io.to(serverId).emit("updateOnlineUsers", Array.from(onlineUsersPerServer.get(serverId)));
          }
        }
      });

      console.log(`✅ Updated Online Users:`, Array.from(onlineUsers.keys()));
    });
    
  });
};

module.exports = setupSocket;