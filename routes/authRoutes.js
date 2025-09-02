const express = require("express");
const router = express.Router();
const { signup, otp, resendOtp } = require("../controllers/authControllers");
const { loginUser, resetPassword } = require("../controllers/authController");

// Routes beginning with /api/auth
router.post("/signup", signup);
router.post("/login", loginUser); // Ensure this route exists
router.post("/otp", otp);
router.post("/otp/resend", resendOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
