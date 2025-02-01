const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  // Get token from the Authorization header
  const token = req.header("Authorization");

  // Check if token exists
  if (!token)
    return res.status(401).json({ message: "No token, authorization denied" });

  // Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user data to request object
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    res.status(400).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;
