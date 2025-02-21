const express = require("express");
const db = require("./config/db");
const cors = require("cors");
const dotNet = require("dotenv");
const http = require("http");
dotNet.config();
const Channel = require('./models/channel.model')
const app = express();
const server = http.createServer(app);


const PORT = 3001;
const {registerUser, loginUser,getUserData} = require('./controllers/auth.controller')
const {sendMessage,getMessages,sendMessageToChannel,getChannelMessages} = require('./controllers/message.controller')
const serverRoutes = require('./routes/server.routes')
const authMiddleware = require('./middleware/auth.middleware');
const { createServer,getServers,getChannelsByServer,createTextChannel,createVoiceChannel } = require('./controllers/server.controller');
const cookieParse = require('cookie-parser');
const setupSocket = require('./config/soket');
app.use(cookieParse());

// Socket setup
const io = setupSocket(server)

// Connect to MongoDB
db();
app.use(cors({ 

  origin: "http://localhost:5173", // Frontend URL
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

app.use((req,res,next) => {
  req.io=io;
  next();
})
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));