import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema({
  userEmail: String,
  jobDescription: String,
  experience: String,
  objectives: [String],
  summary: String,
  atsScore: Number,
  missingSkills: [String],
  keywords: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Request ||
  mongoose.model("Request", RequestSchema);
