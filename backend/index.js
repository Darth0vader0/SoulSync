const express = require("express");
const db = require("./config/db");
const cors = require("cors");
const dotNet = require("dotenv");
dotNet.config();
const app = express();

const PORT = 3001;
const {registerUser, loginUser} = require('./controllers/auth.controller')
const {sendMessage,getMessages} = require('./controllers/message.controller')
const serverRoutes = require('./routes/server.routes')
const authMiddleware = require('./middleware/auth.middleware');
const { createServer } = require('./controllers/server.controller');

// Connect to MongoDB
db();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
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

//messages api
app.get('/:senderId/:receiverId',getMessages);
app.post('/send',sendMessage);

//server routes
app.post('/createServer', authMiddleware, createServer);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));