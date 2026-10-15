const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    requirements: [
      {
        type: String,
      },
    ],

    salary: {
      type: Number,
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    jobType: {
      type: String,
      enum: ["full-time", "part-time", "internship", "contract"],
      required: true,
    },

    experienceLevel: {
      type: String,
      enum: ["fresher", "1-3 years", "3-5 years", "5+ years"],
      required: true,
    },

    position: {
      type: Number,
      required: true,
      min: 1,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;