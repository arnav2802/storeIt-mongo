import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  otp: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);
