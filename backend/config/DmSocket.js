const connectedUsersInDm = new Map();

const DmSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected for DM', socket.id);

    // Handle user connection
    socket.on('userConnectedToDm', (userId) => {
      connectedUsersInDm.set(userId, socket.id);
      socket.join(userId); // Ensure user can receive messages directed to their userId
      console.log(`User ${userId} connected with socket ${socket.id}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      for (const [userId, socketId] of connectedUsersInDm.entries()) {
        if (socketId === socket.id) {
          connectedUsersInDm.delete(userId);
          console.log(`User ${userId} disconnected from DM socket`);
          break;
        }
      }
    });

    // Handle joining a DM room (not needed since users now auto-join their own room)
    socket.on('joinDm', (receiverId) => {
      socket.join(receiverId);
      console.log(`User joined chat room: ${receiverId}`);
    });

    // Handle sending a message
    socket.on('sendMessage', (message) => {
      const { receiverId } = message;

      // Send message to the correct room (userId-based)
      io.to(receiverId).emit("receiveMessage", message);
      
      console.log('Message sent:', message);
    });
  });
};

module.exports = DmSocket;
