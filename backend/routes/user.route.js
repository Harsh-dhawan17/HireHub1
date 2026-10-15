const express = require("express");

const {
  sendRegistrationOTP,
  registerUser,
  loginUser,
  getProfile,
  logoutUser,
  getCurrentUser,
} = require("../controllers/user.controller");

const isAuthenticated = require("../middlewares/isAuthenticated");

const router = express.Router();

// Step 1: Send OTP to email before registration
router.post("/send-otp", sendRegistrationOTP);

// Step 2: Register with OTP verification
router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/profile", isAuthenticated, getProfile);

router.post("/logout", logoutUser);

router.get("/me", isAuthenticated, getCurrentUser);

module.exports = router;