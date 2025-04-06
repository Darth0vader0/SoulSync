const Server = require('../models/server.model'); // Import Server model
const Channel = require('../models/channel.model'); // Import Channel model (for default channels)
const jwt = require('jsonwebtoken');
// Create a new server
const createServer = async (req, res) => {
  // Check if user is authenticated
  try {
    const { name } = req.body;
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
    const resources = new Channel({
      name: 'resources',
      type: 'resources',
      serverId: newServer._id,
    });

    await generalTextChannel.save();
    await generalVoiceChannel.save();
    await resources.save();

    // Update server with created channels
    newServer.channels = [generalTextChannel._id, generalVoiceChannel._id,resources._id];
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

  try {
    const userId = req.user.userId; // Get user ID from token

    // Find servers where the user is an owner or a member
    const servers = await Server.find({
        $or: [{ owner: userId }, { members: userId }]
    });
    
    res.status(200).json({ success: true, servers });
} catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
}
  
}

const createTextChannel = async (req,res)=>{
  const channelName = req.body.channelName;
  const ownerId = req.user.userId;
  const serverId = req.query.serverId;


  try {
    if (!channelName) return res.status(400).json({msg: 'Channel name is required'});
    const type = 'text';

    const server = await Server.findById(serverId);
    if(server.ownerId.toString() !== ownerId) return res.status(400).json({msg : "only owner can access create channel"});
    if (!server) return res.status(404).json({ error: 'Server not found' });
    const channel = new Channel({
      name: channelName,
      type,
      serverId,
    });
    await channel.save();
    server.channels.push(channel._id)
    await server.save();
    res.status(200).json({
      message: 'Channel created successfully',
    });
  } catch (error) {
    cosole.log(error.message)
    res.status(500).json({ success: false, message: "Server error" });
  }
}


const createVoiceChannel = async (req,res)=>{
  const ownerId = req.user.userId;
  const serverId = req.query.serverId;
  const server = await Server.findById(serverId);
  if (!server) return res.status(404).json({ error: 'Server not found' });
  if(server.ownerId.toString()!==ownerId) return res.status(401).json({msg:'you are not allowed to create'})
  try {
    const voiceChannelName = req.body.voiceChannelName;
    if (!voiceChannelName) return res.status(400).json({msg: 'Channel name is required'});
    const type = 'voice';

    const channel = new Channel({
      name: voiceChannelName,
      type,
      serverId,
    });
    await channel.save();
    server.channels.push(channel._id)
    await server.save();
    res.status(200).json({
      message: 'Channel created successfully',
    });
    
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Server error" });
  }
}


const getChannelsByServer = async (req, res) => {

  try {
    const  serverId  = req.query.serverId;

    // Find all channels that belong to the server
    const channels = await Channel.find({ serverId });

    res.json({ success: true, channels });
  } catch (error) {
    console.error("Error fetching channels:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

const joinServerViaInvite = async (req, res) => {
  const serverLink = req.body.inviteUrl;
  if (!serverLink) {
    console.error("Missing server link");
    return res.status(400).json({ error: "Missing server link" });
  }

  if (serverLink.slice(0, 18) !== 'https://soul-sync/') {
    console.error('Invalid server link');
    return res.status(400).json({ error: 'Invalid server link' });
  }
  const serverId = serverLink.slice(18);
  const userId = req.user.userId;

  try {
    const server = await Server.findById(serverId);
    if (!server) return res.status(404).json({ error: 'Server not found' });
    if (server.members.includes(userId)) {
      console.error('User is already a member of this server');
      return res.status(400).json({ error: 'User is already a member of this server' });
    }
    server.members.push(userId);
    await server.save();
    res.status(200).json({ message: 'User joined server successfully' ,server: server ,success:true});
    } catch (error) {
    console.error('Error joining server:', error);
    res.status(500).json
    ({ error: 'Internal Server Error' });
    }

}



const getServerMembers = async (req, res) => {
  try {
    const { serverId } = req.params;

    // Fetch all users from the given server
    const server = await Server.findById(serverId).populate("members", "username _id");
    
    if (!server) {
      return res.status(404).json({ success: false, message: "Server not found" });
    }

    res.json({ success: true, members: server.members });
  } catch (error) {
    console.error("Error fetching server members:", error);
    res.status(500).json({ success: false, message: "Failed to fetch members" });
  }
};

module.exports = { createServer ,getServers,getChannelsByServer,createTextChannel,createVoiceChannel,getServerMembers,joinServerViaInvite};
