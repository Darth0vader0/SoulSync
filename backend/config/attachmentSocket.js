const connectedUsersInAttchmentChannel = new Map();


const attachmentsSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected for attachments", socket.id);
    
        // Handle user connection
        socket.on("userConnectedToAttachmentChannel", ({ userId, channelId }) => {
        connectedUsersInAttchmentChannel.set(userId, socket.id);
        socket.join(channelId); // Ensure user can receive messages directed to their channelId
        console.log(`User ${userId} connected with socket ${socket.id} in channlId ${channelId}`);
        });
        
        //handle leave channel
        socket.on("leaveChannel", (channelId) => {
            socket.leave(channelId);
            console.log(`User ${socket.id} left channel ${channelId}`);
        });

        // Handle disconnection
        socket.on("disconnect", () => {
        for (const [userId, socketId] of connectedUsersInAttchmentChannel.entries()) {
            if (socketId === socket.id) {
            connectedUsersInAttchmentChannel.delete(userId);
            console.log(`User ${userId} disconnected from attachment socket`);
            break;
            }
        }
        });
    
       
    
    });
}

module.exports = attachmentsSocket;