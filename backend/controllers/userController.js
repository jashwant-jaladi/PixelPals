import User from "../models/userModel.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto"
import generateAndSetCookies from "../utils/helper/generateAndSetCookies.js";
import { v2 as cloudinary } from "cloudinary";
import Post from "../models/postModel.js";


const signupUser = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;
        const user = await User.findOne({ $or: [{ email }, { username }] })
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword
        })
        if (newUser) {
            generateAndSetCookies(newUser._id, res);
        }
        const savedUser = await newUser.save();
        res.status(201).json({ message: "User created successfully", user: savedUser });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user.isFrozen) {
            user.isFrozen = false;
            await user.save();
        }
        if (user && (await bcrypt.compare(password, user.password))) {
            generateAndSetCookies(user._id, res);
            return res.status(201).json({ message: "Login successful", user });
        }
        else {
            return res.status(400).json({ message: "Invalid credentials" });
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const logoutUser = (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
};


  


const updateProfile = async (req, res) => {
    const { name, email, username, password, bio } = req.body;
    let { profilePic } = req.body;

    const userId = req.user._id;

    try {
        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (req.params.id !== userId.toString()) {
            return res.status(403).json({ error: "You cannot update other user's profile" });
        }

        // Check if email or username already exists
        if (email !== user.email || username !== user.username) {
            const existingUser = await User.findOne({
                $or: [
                    { email: email, _id: { $ne: userId } },
                    { username: username, _id: { $ne: userId } }
                ]
            });
            if (existingUser) {
                return res.status(400).json({
                    error: `${email === existingUser.email ? 'Email' : 'Username'} already exists`
                });
            }
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }

        // Handle profilePic if present in the request
        if (profilePic && profilePic !== user.profilePic) {
            try {
                if (user.profilePic) {
                    const publicId = user.profilePic.split("/").pop().split(".")[0];
                    await cloudinary.uploader.destroy(publicId);
                }

                const uploadedResponse = await cloudinary.uploader.upload(profilePic, {
                    upload_preset: "social_media",
                });
                profilePic = uploadedResponse.secure_url;
            } catch (error) {
                console.error("Error handling profile picture:", error);
                return res.status(500).json({ error: "Error processing profile picture" });
            }
        }

        // Update user details
        user.name = name || user.name;
        user.email = email || user.email;
        user.username = username || user.username;
        user.profilePic = profilePic || user.profilePic;
        user.bio = bio || user.bio;

        await user.save();
        await Post.updateMany(
            { "comments.userId": userId },
            {
                $set: {
                    "comments.$[comment].username": user.username,
                    "comments.$[comment].profilePic": user.profilePic,
                },
            },
            { arrayFilters: [{ "comment.userId": userId }] }
        );
        user.password = null;
        // Create a sanitized user object without password
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            profilePic: user.profilePic,
            bio: user.bio,
            followers: user.followers,
            following: user.following
        };

        res.status(200).json({ user: userResponse }); // Match the expected response structure
    } catch (err) {
        console.error("Error in updateUser: ", err);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};



const getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select("-password").select("-updatedAt");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error("Error in getUserProfile:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

const getSuggestedUsers = async (req, res) => {
    try {
        // exclude the current user from suggested users array and exclude users that current user is already following
        const userId = req.user._id;

        const usersFollowedByYou = await User.findById(userId).select("following");

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId },
                },
            },
            {
                $sample: { size: 10 },
            },
        ]);
        const filteredUsers = users.filter((user) => !usersFollowedByYou.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0, 4);

        suggestedUsers.forEach((user) => (user.password = null));

        res.status(200).json(suggestedUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

};

const deleteUser = async (req, res) => {
    try {
      const { userId } = req.body; // Get userId from request body
  
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
  
      // Step 1: Check if the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Step 2: Delete the user
      await User.findByIdAndDelete(userId);
  
      // Step 3: Delete all related posts and comments
      await Post.deleteMany({ userId });
  
      // Step 4: Remove user from followers and following
      await User.updateMany(
        { $or: [{ followers: userId }, { following: userId }] },
        { $pull: { followers: userId, following: userId } }
      );
      
  
      res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

const privateAccount = async (req, res) => {
    try {
        const userId = req.user._id;

        // Step 1: Fetch the current user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Step 2: Toggle the private field
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { private: !user.private }, // Use the fetched user's private field
            { new: true }
        );

        // Step 3: Return the response
        res.status(200).json({
            message: "Private mode toggled successfully",
            success: true,
            private: updatedUser.private // Optionally return the updated private status
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use your email service provider
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASSWORD, // Your email password or app password
    },
});

const resetLink = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Generate reset token and update user record
        const resetToken = user.generatePasswordResetToken(); 

        // Save user after setting token (only one `.save()`)
        await user.save({ validateBeforeSave: false });

        // Construct reset URL
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        // Email content
        const mailOptions = {
            from: `"PixelPals Support" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Password Reset Request",
            html: `
                <p>Hello ${user.name || "User"},</p>
                <p>You requested a password reset. Click below to reset:</p>
                <a href="${resetUrl}" style="text-decoration:none; color:#fff; background:#007bff; padding:10px 15px; border-radius:5px;">Reset Password</a>
                <p>Link expires in 15 minutes. If you didn't request this, ignore this email.</p>
                <p>Thank you,</p>
                <p>PixelPals Team</p>
            `,
        };

        // Send email (Ensure transporter is defined and working)
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Reset link sent successfully" });
    } catch (error) {
        console.error("Error in resetLink:", error);
        res.status(500).json({ error: error.message || "Something went wrong." });
    }
};



const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        console.log(token);
        const { password } = req.body;

        // Hash the provided token (because we store it hashed)
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        // Find user with matching reset token and valid expiration time
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }, // Ensure token is not expired
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // Hash and save the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Clear reset token fields (invalidate token)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Something went wrong" });
    }
};



// controllers/userController.js
const guestLogin = async (req, res) => {
    try {
      const guestUser = await User.findOne({ email: "jashwant.jvs@gmail.com" });
  
      if (!guestUser) {
        return res.status(404).json({ error: "Guest user not found" });
      }
  
      // Use your helper function to generate the token and set cookies
      const token = generateAndSetCookies(guestUser, res);
  
      res.status(200).json({ token, user: guestUser }); // Also send user data
    } catch (error) {
      console.error("Guest Login Error:", error);
      res.status(500).json({ error: "Guest login failed" });
    }
  };
  





export { signupUser, loginUser, logoutUser,  privateAccount,  updateProfile, getUserProfile, getSuggestedUsers, deleteUser, resetLink, resetPassword, guestLogin };