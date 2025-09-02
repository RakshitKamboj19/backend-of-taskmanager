const User = require("../models/User");

exports.getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ status: false, msg: "Unauthorized access" });
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ status: false, msg: "User not found" });
    }

    res.status(200).json({ user, status: true, msg: "Profile found successfully." });
  } catch (err) {
    console.error("Error in getProfile:", err.message);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
};