import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
  image: String,
  dailyCount: { type: Number, default: 0 },
  lastUsed: Date,
});

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);
