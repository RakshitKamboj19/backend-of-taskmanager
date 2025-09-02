const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
  },
  joiningTime: {
    type: Date,
    default: Date.now
    
  },
  isverified:{
    type: Boolean,
    default: false
  },
  otp : {
    type : Number ,
    default : null

  },
  otpExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true

});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Verify OTP method
userSchema.methods.verifyOtp = function (otp) {
  return this.otp === otp;
};

// Reset OTP after verification
userSchema.methods.resetOtp = function () {
  this.otp = null;
  this.isverified = true;
};

const User = mongoose.model("User", userSchema);
module.exports = User;