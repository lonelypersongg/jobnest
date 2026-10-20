
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
    cvFilename: {
      type: String,
      required: true,
    },
    cvPath: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Prevent one user from applying to the same job twice.
applicationSchema.index(
  { job: 1, applicant: 1 },
  { unique: true }
);

module.exports = mongoose.model("Application", applicationSchema);