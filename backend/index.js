const express = require("express");
const db = require("./config/db");
const cors = require("cors");
const dotNet = require("dotenv");
const http = require("http");
dotNet.config();
const Channel = require('./models/channel.model');
const User = require('./models/User.model');

const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");

const PORT = 3001;

// Import controllers and middleware
const { registerUser, loginUser, getUserData } = require('./controllers/auth.controller');
const { sendMessage, getMessages, sendMessageToChannel, getChannelMessages } = require('./controllers/message.controller');
const serverRoutes = require('./routes/server.routes');
const authMiddleware = require('./middleware/auth.middleware');
const { createServer, getServers, getChannelsByServer, createTextChannel, createVoiceChannel } = require('./controllers/server.controller');
const cookieParse = require('cookie-parser');

app.use(cookieParse());

// 🔹 **Create Only One Socket.io Instance**
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://192.168.242.210:5173"], // Adjust for your frontend
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 🔹 **Pass the Same `io` to Both Messaging & Voice Handling**
require("./config/soket")(io);        // Messaging
require("./config/voiceSocket")(io);  // Voice Channels

// Connect to MongoDB
db();

app.use(cors({
  origin: ["http://localhost:5173", "http://192.168.242.210:5173"],
  credentials: true
}));

const rateLimit = require("express-rate-limit");
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: "Too many requests, please try again later."
});

app.use(limiter);

// Routes   
app.post('/signup', registerUser);
app.post('/login', loginUser);
app.get('/getUserData', authMiddleware, getUserData);

// Messages API
app.get('/:senderId/:receiverId', getMessages);
app.post('/send', sendMessage);
app.post('/sendMessageToChannel', authMiddleware, sendMessageToChannel);
app.get("/getChannelMessages", getChannelMessages);

// Server Routes
app.post('/createServer', authMiddleware, createServer);
app.get('/getServers', authMiddleware, getServers);
app.get('/getChannelsByServer', authMiddleware, getChannelsByServer);
app.post('/createTextChannel', authMiddleware, createTextChannel);
app.post('/createVoiceChannel', authMiddleware, createVoiceChannel);

// Get User Route
app.get("/getUser", async (req, res) => {
  try {
    const user = await User.findById(req.query.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Attach Socket.io to Requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
