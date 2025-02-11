const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Log cookies to check if JWT is present
  console.log("Cookies:", req.cookies);

  // Get token from cookies
  const token = req.cookies.jwt;

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
