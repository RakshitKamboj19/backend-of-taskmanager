const jwt = require("jsonwebtoken");
const User = require("../models/User");


exports.verifyAccessToken = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: false, msg: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1]; // Extract token after "Bearer"
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    return res.status(401).json({ status: false, msg: "Invalid token" });
  }

  try {
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ status: false, msg: "User not found" });
    }

    req.user = user; // Attach user to the request
    next();
  } catch (err) {
    console.error("Error in verifyAccessToken:", err.message);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
};