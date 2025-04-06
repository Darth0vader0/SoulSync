const onlineUsers = new Map(); // { userId: Set(socketIds) }
const onlineUsersPerServer = new Map(); // { serverId: Set(userIds) }

const handleUserConnected = (socket, io, { userId, serverIds }) => {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socket.id); // Store multiple connections per user

  serverIds.forEach((serverId) => {
    socket.join(serverId);
    if (!onlineUsersPerServer.has(serverId)) {
      onlineUsersPerServer.set(serverId, new Set());
    }
    onlineUsersPerServer.get(serverId).add(userId);

    // Emit updated online users to all in the server
    io.to(serverId).emit("updateOnlineUsers", Array.from(onlineUsersPerServer.get(serverId)));
  });

};

const handleUserDisconnected = (socket, io) => {

  let disconnectedUserId = null;

  // Find the user associated with this socket
  for (const [userId, sockets] of onlineUsers.entries()) {
    if (sockets.has(socket.id)) {
      disconnectedUserId = userId;
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        onlineUsers.delete(userId);
      }
      break;
    }
  }

  if (!disconnectedUserId) return;

  // Remove user from all servers they were part of
  for (const [serverId, userSet] of onlineUsersPerServer.entries()) {
    userSet.delete(disconnectedUserId);
    if (userSet.size === 0) {
      onlineUsersPerServer.delete(serverId);
    } else {
      io.to(serverId).emit("updateOnlineUsers", Array.from(userSet));
    }
  }

};

const setupSocket = (io) => {
  io.on("connection", (socket) => {

    socket.on("userConnected", (data) => handleUserConnected(socket, io, data));
    socket.on("disconnect", () => handleUserDisconnected(socket, io));

    socket.on("joinChannel", (channelId) => {
      socket.join(channelId);
    });

    socket.on("sendMessage", (message) => {
      const { channelId } = message;
      io.to(channelId).emit("receiveMessage", message);
    });
  });
};

module.exports = setupSocket;
