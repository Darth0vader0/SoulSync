const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
// Register User
const registerUser = async (req, res) => {
  try {    
    const { username, email, password } = req.body;
    console.log(req.body);
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({ username, email, password: hashedPassword });
    await user.save();
    console.log(user);
    res.status(201).json({ message: "User registered successfully" ,user : user});
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ message: "Server error in signup", error });
  }
};
const getPublicKey = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user || !user.publicKey) {
      return res.status(404).json({ message: "Public key not found" });
    }
    res.status(200).json({ publicKey: user.publicKey });
  } catch (error) {
    console.error("Error fetching public key:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getAllUsers = async (req,res)=>{
  try {
    const users = await User.find().select('-password');
    if (!users) {
      return res.status(404).json({ success: false, message: "Users not found" });
    }
    res.status(200).json({ success : true ,users });

  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Server error", error });
  }
}

const savePublicKey = async (req,res) => {

  try {
    const { userId, publicKey } = req.body;

    if (!userId || !publicKey) {
      return res.status(400).json({ message: 'userId and publicKey are required' });
    }

    // Update the user’s document
    const user = await User.findByIdAndUpdate(
      userId,
      { publicKey },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'Public key stored', userId: user._id });
  } catch (err) {
    console.error('Error storing public key:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Login User
const loginUser = async (req, res) => {
 
  try {    
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id,username:user.username }, process.env.JWT_SECRET);

    res.cookie("jwt",token,{
      maxAge :3600*1000*24,
      httpOnly:true,
      sameSite: "none",
      secure : true
  });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getUserData = async (req,res)=>{
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success : true ,user });

  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Server error", error });
  }
}
const logout = (req,res)=>{
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true, 
    sameSite: "Strict",
    path: "/",
});
res.status(200).json({ message: "Logged out successfully" });
}
module.exports = { registerUser, loginUser ,getPublicKey,logout,getUserData,getAllUsers,savePublicKey};
