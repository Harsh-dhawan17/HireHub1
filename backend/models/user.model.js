const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["student", "recruiter"],
      default: "student"
    },

    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;