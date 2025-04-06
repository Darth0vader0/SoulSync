const connectedUsersInAttchmentChannel = new Map();


const attachmentsSocket = (io) => {
    io.on("connection", (socket) => {
        // Handle user connection
        socket.on("userConnectedToAttachmentChannel", ({ userId, channelId }) => {
        connectedUsersInAttchmentChannel.set(userId, socket.id);
        socket.join(channelId); // Ensure user can receive messages directed to their channelId
        });
        
        //handle leave channel
        socket.on("leaveChannel", (channelId) => {
            socket.leave(channelId);
        });

        // Handle disconnection
        socket.on("disconnect", () => {
        for (const [userId, socketId] of connectedUsersInAttchmentChannel.entries()) {
            if (socketId === socket.id) {
            connectedUsersInAttchmentChannel.delete(userId);
            break;
            }
        }
        });
    
    });
}

module.exports = attachmentsSocket;