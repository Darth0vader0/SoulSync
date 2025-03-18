const express = require("express");
const db = require("./config/db");
const cors = require("cors");
const dotNet = require("dotenv");
const http = require("http");
dotNet.config();
const Channel = require('./models/channel.model')
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const User = require('./models/User.model');

const PORT = 3001;
const {registerUser, loginUser,getUserData} = require('./controllers/auth.controller')
const {sendMessage,getMessages,sendMessageToChannel,getChannelMessages} = require('./controllers/message.controller')

const authMiddleware = require('./middleware/auth.middleware');
const { createServer,getServers,getChannelsByServer,createTextChannel,createVoiceChannel,joinServerViaInvite } = require('./controllers/server.controller');
const cookieParse = require('cookie-parser');
// Connect to MongoDB
db();

app.use(cookieParse());

// Socket setup
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://192.168.242.210:5173","https://soul-sync-omega.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
  }
});
const setupSocket = require("./config/soket");
const setupVoiceSocket = require("./config/voiceSocket");
setupSocket(io);        // Messaging
setupVoiceSocket(io);  // Voice Channels



app.use(cors({ 

  origin: ["http://localhost:5173","http://192.168.242.210:5173","https://soul-sync-omega.vercel.app"], // Frontend URL
  credentials: true, // Required for cookies
  
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
app.post('/signup', registerUser)
app.post('/login', loginUser)
app.get('/getUserData',authMiddleware,getUserData)
//messages api
app.get('/:senderId/:receiverId',getMessages);
app.post('/send',sendMessage);
app.post('/sendMessageToChannel',authMiddleware,sendMessageToChannel);
app.get("/getChannelMessages",getChannelMessages)

//server routes

app.post('/createServer',authMiddleware, createServer);
app.get('/getServers',authMiddleware,getServers)
app.get('/getChannelsByServer',authMiddleware, getChannelsByServer);
app.post('/createTextChannel',authMiddleware,createTextChannel)
app.post('/createVoiceChannel',authMiddleware,createVoiceChannel)
app.post("/joinServer",authMiddleware,joinServerViaInvite)

app.get("/getUser", async (req, res) => {
  try {
    const user = await User.findById(req.query.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.use((req,res,next) => {
  req.io=io;
  next();
})

server.listen(PORT,() => console.log(`Server running on port ${PORT}`));