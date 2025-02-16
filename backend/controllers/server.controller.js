const Server = require('../models/server.model'); // Import Server model
const Channel = require('../models/channel.model'); // Import Channel model (for default channels)
const jwt = require('jsonwebtoken');
// Create a new server
const createServer = async (req, res) => {
  console.log("into");
  console.log("next");
  
  
  try {
    const { name } = req.body;
    console.log(req.cookies.jwt)

     // Assuming authentication middleware attaches `user` object to `req`
    
    if (!name) {
      return res.status(400).json({ error: 'Server name is required' });
    }

    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId; // Assuming JWT token contains user ID
    // Create new server
    const newServer = new Server({
      name,
      ownerId: userId,
      members: [userId], // Owner is automatically a member
    });

    await newServer.save();

    // Create default channels (e.g., "general" text channel, "General Voice" voice channel)
    const generalTextChannel = new Channel({
      name: 'general',
      type: 'text',
      serverId: newServer._id,
    });

    const generalVoiceChannel = new Channel({
      name: 'General Voice',
      type: 'voice',
      serverId: newServer._id,
    });

    await generalTextChannel.save();
    await generalVoiceChannel.save();

    // Update server with created channels
    newServer.channels = [generalTextChannel._id, generalVoiceChannel._id];
    await newServer.save();

    return res.status(201).json({
      message: 'Server created successfully',
      server: newServer,
    });
  } catch (error) {
    console.error('Error creating server:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getServers = async (req,res)=>{
  console.log("into");
  
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // Assuming JWT token contains user ID

  try {
    const userId = decoded.userId; // Get user ID from token

    // Find servers where the user is an owner or a member
    const servers = await Server.find({
        $or: [{ owner: userId }, { members: userId }]
    });
    console.log(servers);
    
    res.json({ success: true, servers });
} catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
}
  
}

module.exports = { createServer ,getServers};
