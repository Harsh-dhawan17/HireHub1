const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    resumeFileName: {
      type: String,
      default: "",
    },

    resumeText: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    coverNote: {
      type: String,
      default: "",
    },

    experienceAnswers: [
      {
        skill: { type: String, required: true },
        years: { type: String, required: true },
      },
    ],

    atsScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    matchDetails: {
      matchedSkills: [{ type: String }],
      missingSkills: [{ type: String }],
      strengths: [{ type: String }],
      improvements: [{ type: String }],
      summary: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model(
  "Application",
  applicationSchema
);

module.exports = Application;