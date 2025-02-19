import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    profilePic: { type: String, default: "" },
    followers: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    following: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    bio: { type: String, default: "" },
    private: { type: Boolean, default: false },
    Requested: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },

}, { timestamps: true });

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex"); // Generate random token
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex"); // Hash token
  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // Token expires in 15 minutes
  return resetToken; 
};

const User = mongoose.model('User', userSchema);

export default User;
