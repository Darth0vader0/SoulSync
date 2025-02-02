const express = require("express");
const db = require("./config/db");
const cors = require("cors");
const dotNet = require("dotenv");
dotNet.config();
const app = express();
const PORT = 3001;
const {registerUser, loginUser} = require('./controllers/auth.controller')
const {sendMessage,getMessages} = require('./controllers/message.controller')
// Connect to MongoDB
db();
app.use(express.json());
app.use(cors());

// Routes   
app.post('/signup', registerUser)
app.post('/login', loginUser)


//messages api
app.get('/:senderId/:receiverId',getMessages);
app.post('/send',sendMessage);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));