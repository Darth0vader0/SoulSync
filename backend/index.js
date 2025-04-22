const express = require("express");
const db = require("./config/db");
const cors = require("cors");
const dotNet = require("dotenv");
const http = require("http");
dotNet.config();

const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");


const PORT = 3001;
const {registerUser, loginUser,logout,getUserData,getAllUsers,savePublicKey} = require('./controllers/auth.controller')
const {getMessages,sendMessageToChannel,getChannelMessages} = require('./controllers/message.controller')
const authMiddleware = require('./middleware/auth.middleware');
const uploadMiddleware = require('./middleware/attachments.middleware');
const {sendAttachments,getAttachments} = require('./controllers/attachments.controller')
const { createServer,getServers,getChannelsByServer,getServerMembers,createTextChannel,createVoiceChannel,joinServerViaInvite } = require('./controllers/server.controller');
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
const DmSocket = require("./config/DmSocket");  
const attachmentsSocket = require("./config/attachmentSocket");
setupSocket(io);        // Messaging
setupVoiceSocket(io);  // Voice Channels
DmSocket(io);    // Direct Messaging
attachmentsSocket(io); // Attachments

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
app.get('/getAllUsers',authMiddleware,getAllUsers)
app.get('/logout',logout)
app.post('/savePublicKey',savePublicKey);
//messages api
app.get('/:senderId/:receiverId',authMiddleware,getMessages);
app.post('/sendMessageToChannel',authMiddleware,sendMessageToChannel);
app.get("/getChannelMessages",authMiddleware,getChannelMessages)

//server routes

app.post('/createServer',authMiddleware, createServer);
app.get('/getServers',authMiddleware,getServers)
app.get('/getChannelsByServer',authMiddleware, getChannelsByServer);
app.post('/createTextChannel',authMiddleware,createTextChannel)
app.post('/createVoiceChannel',authMiddleware,createVoiceChannel)
app.post("/joinServer",authMiddleware,joinServerViaInvite)
app.get("/server/:serverId/members",getServerMembers);


//attachments routes
app.post("/sendAttachments",authMiddleware,uploadMiddleware,sendAttachments);
app.get("/getAttachments",authMiddleware,getAttachments);
app.set("io",io);
app.use((req,res,next) => {
  req.io=io;
  next();
})

server.listen(PORT,() => console.log(`Server running on port ${PORT}`));