module.exports = (io) => {
    const dmNamespace = io.of("/dm");
  
    dmNamespace.on("connection", (socket) => {
      console.log(`🟢 User connected to DM: ${socket.id}`);
  
      // User joins DM room
      socket.on("joinDm", ({ userId }) => {
        socket.join(userId);
        console.log(`User ${userId} joined DM room`);
      });
  
      // Handle sending DM messages
      socket.on("sendDmMessage", (message) => {
        const { senderId, receiverId } = message;
  
        // Send only to the receiver
        dmNamespace.to(receiverId).emit("receiveDmMessage", message);
      });
  
      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(`🔴 User disconnected from DM: ${socket.id}`);
      });
    });
  };
  