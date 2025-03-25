const connectedUsersInDm = new Map();

const DmSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected for DM', socket.id);

    // Handle user connection
    socket.on('userConnected', (userId) => {
      // Store the socket ID for the connected user
      connectedUsersInDm.set(userId, socket.id);
      console.log(`User ${userId} connected to DM socket`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      // Remove the user from connected users when they disconnect
      for (const [userId, socketId] of connectedUsersInDm.entries()) {
        if (socketId === socket.id) {
          connectedUsersInDm.delete(userId);
          console.log(`User ${userId} disconnected from DM socket`);
          break;
        }
      }
    });

    // Handle joining a specific DM room
    socket.on('joinDm', (receiverId) => {
      socket.join(receiverId);
      console.log("Active user joined chat of", receiverId);
    });

    // Handle sending a message
    socket.on('sendMessage', (message) => {
      const { receiverId } = message;
      
      // Emit the message to the specific receiver's room
      io.to(receiverId).emit("receiveMessage", message);
      
      // Optional: You might want to save the message to a database here
      console.log('Message sent:', message);
    });
  });
};

module.exports = DmSocket;