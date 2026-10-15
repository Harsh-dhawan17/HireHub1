const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  generateOTP,
  sendOTPEmail,
  storeOTP,
  verifyOTP,
} = require("../services/email.service");

// ==========================================
// 1. SEND OTP (Step 1 of registration)
// ==========================================

const sendRegistrationOTP = async (req, res) => {
  try {
    const { email, fullname } = req.body;

    if (!email || !fullname) {
      return res.status(400).json({
        message: "Email and full name are required",
      });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address format" });
    }

    // Check if email already registered and verified
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        message: "An account with this email already exists. Please log in.",
      });
    }

    // Generate & store OTP
    const otp = generateOTP();
    storeOTP(email, otp);

    // Send OTP email
    const result = await sendOTPEmail(email, fullname, otp);

    if (!result.success) {
      return res.status(500).json({
        message: "Failed to send verification email. Please try again.",
      });
    }

    return res.status(200).json({
      message: "Verification code sent to your email. Please check your inbox.",
      ...(result.previewUrl ? { previewUrl: result.previewUrl } : {}),
    });
  } catch (error) {
    console.error("sendRegistrationOTP error:", error);
    return res.status(500).json({
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

// ==========================================
// 2. REGISTER (Step 2 – verify OTP then create account)
// ==========================================

const registerUser = async (req, res) => {
  try {
    const { fullname, email, password, role, otp } = req.body;

    // Check if all required fields are provided
    if (!fullname || !email || !password || !otp) {
      return res.status(400).json({
        message: "All required fields must be provided, including the OTP",
      });
    }

    // Verify the OTP
    const otpResult = verifyOTP(email, otp);
    if (!otpResult.valid) {
      return res.status(400).json({ message: otpResult.reason });
    }

    // Check if user already exists and is verified
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (existingUser) {
      // Update the existing unverified user record
      existingUser.fullname = fullname;
      existingUser.password = hashedPassword;
      existingUser.role = role || "student";
      existingUser.isVerified = true;
      user = await existingUser.save();
    } else {
      // Create new user
      user = await User.create({
        fullname,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || "student",
        isVerified: true,
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Store JWT in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const userResponse = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };

    return res.status(201).json({
      message: "Account verified and created successfully! Welcome to HireHub.",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("registerUser error:", error);
    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

// ==========================================
// 3. LOGIN
// ==========================================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Block unverified users
    if (!user.isVerified) {
      return res.status(403).json({
        message:
          "Your email is not verified. Please complete registration with OTP verification.",
      });
    }

    // Compare entered password with hashed password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Store JWT in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
    });
  } catch (error) {
    console.error("loginUser error:", error);
    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

// ==========================================
// 4. GET PROFILE
// ==========================================

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

// ==========================================
// 5. LOGOUT
// ==========================================

const logoutUser = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Logout failed",
      error: error.message,
    });
  }
};

// ==========================================
// 6. GET CURRENT USER
// ==========================================

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Current user fetched successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch current user",
      error: error.message,
    });
  }
};

module.exports = {
  sendRegistrationOTP,
  registerUser,
  loginUser,
  getProfile,
  logoutUser,
  getCurrentUser,
};