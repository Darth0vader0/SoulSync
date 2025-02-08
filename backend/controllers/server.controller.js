const Server = require('../models/server.model'); // Import Server model
const Channel = require('../models/channel.model'); // Import Channel model (for default channels)

// Create a new server
const createServer = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id; // Assuming authentication middleware attaches `user` object to `req`

    if (!name) {
      return res.status(400).json({ error: 'Server name is required' });
    }

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

module.exports = { createServer };
