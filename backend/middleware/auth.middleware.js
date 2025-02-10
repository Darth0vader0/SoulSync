const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Log headers to check if Authorization header is present
  console.log("Headers:", req.headers);

  // Get token from the Authorization header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user data to request object
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    console.error("Invalid token:", error);
    res.status(400).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;
