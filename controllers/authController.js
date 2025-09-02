const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    console.log("[loginUser] Incoming body keys:", Object.keys(req.body || {}));
    console.log("[loginUser] Raw email:", typeof email === 'string' ? email : email, "password type:", typeof password);
    if (typeof email === "string") email = email.trim().toLowerCase();

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    // Find user in the database
    const user = await User.findOne({ email });
    console.log("[loginUser] Lookup email:", email, "Found:", !!user);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Check if the user is verified
    if (!user.isverified) {
      console.log("[loginUser] User not verified:", user._id?.toString());
      return res.status(403).json({ error: "User is not verified. Please verify your account." });
    }

    // Check password
    let isPasswordValid = await user.comparePassword(password);
    console.log("[loginUser] Password match:", isPasswordValid, "for user:", user._id?.toString());

    // Plaintext legacy fallback: if stored password is not a bcrypt hash and matches exactly,
    // re-save to trigger hashing in the model pre-save hook and continue.
    if (!isPasswordValid) {
      const storedPassword = user.password || "";
      const looksHashed = typeof storedPassword === "string" && storedPassword.startsWith("$2");
      if (!looksHashed && storedPassword === password) {
        console.warn("[loginUser] Detected plaintext legacy password. Auto-migrating to hashed password for user:", user._id?.toString());
        user.password = password; // pre-save hook will hash
        await user.save();
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      msg: "Login successful",
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error("Error in loginUser:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Simple password reset to fix accounts impacted by earlier double-hashing
// Expects: { email, newPassword }
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and newPassword are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Optional guard: ensure user is verified
    if (!user.isverified) {
      return res.status(403).json({ error: "User is not verified." });
    }

    // Assign new password; model pre-save hook will hash it
    user.password = newPassword;
    await user.save();

    return res.status(200).json({ msg: "Password reset successfully. Please login with your new password." });
  } catch (err) {
    console.error("Error in resetPassword:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Find user in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    user.otp = otp;
    await user.save();

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Task Manager",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ msg: "OTP sent successfully." });
  } catch (err) {
    console.error("Error in sendOtp:", err.message);
    res.status(500).json({ error: "Failed to send OTP." });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required." });
    }

    // Find user in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Verify OTP
    if (user.otp !== parseInt(otp)) {
      return res.status(400).json({ error: "Invalid OTP." });
    }

    // Mark user as verified
    user.isverified = true;
    user.otp = null; // Clear OTP after verification
    await user.save();

    res.status(200).json({ msg: "OTP verified successfully." });
  } catch (err) {
    console.error("Error in verifyOtp:", err.message);
    res.status(500).json({ error: "Failed to verify OTP." });
  }
};
