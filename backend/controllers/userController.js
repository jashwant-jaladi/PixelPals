import User from "../models/userModel.js";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import generateAndSetCookies from "../utils/helper/generateAndSetCookies.js";
import { v2 as cloudinary } from "cloudinary";
import post from "../models/postModel.js";


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

const followandUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params; // ID of the user to follow/unfollow
        const currentUser = req.user; // Currently authenticated user

        if (id === currentUser._id.toString()) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        // Find the user to be followed/unfollowed
        const targetUser = await User.findById(id);
        if (!targetUser) {
            return res.status(404).json({ message: "Target user not found" });
        }

        // Check if the current user is following the target user
        const isFollowing = targetUser.followers.includes(currentUser._id);

        if (isFollowing) {
            // Unfollow
            await User.findByIdAndUpdate(id, { $pull: { followers: currentUser._id } });
            await User.findByIdAndUpdate(currentUser._id, { $pull: { following: id } });
            return res.status(200).json({ message: "User unfollowed successfully" });
        } else {
            // Follow
            await User.findByIdAndUpdate(id, { $push: { followers: currentUser._id } });
            await User.findByIdAndUpdate(currentUser._id, { $push: { following: id } });
            return res.status(200).json({ message: "User followed successfully" });
        }
    } catch (err) {
        console.error("Error in followandUnfollowUser:", err); // Log the error
        res.status(500).json({ message: "Internal server error" });
    }
};


const getFollowersAndFollowing = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
            .populate("followers", "name profilePic username")
            .populate("following", "name profilePic username");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            followers: user.followers,
            following: user.following
        });
    } catch (err) {
        console.error("Error fetching followers/following:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const followUnfollowDialog = async (req, res) => {
  try {
    const { userId } = req.body; // Get userId from the request body
    const currentUser = req.user; // Authenticated user

    if (userId === currentUser._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Find the target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = targetUser.followers.includes(currentUser._id);

    if (isFollowing) {
      // Unfollow logic
      await Promise.all([
        User.findByIdAndUpdate(userId, { $pull: { followers: currentUser._id } }),
        User.findByIdAndUpdate(currentUser._id, { $pull: { following: userId } }),
      ]);

      // Fetch updated target user
      const updatedUser = await User.findById(userId);
      return res.status(200).json({ message: "User unfollowed successfully", updatedUser });
    } else {
      // Follow logic
      await Promise.all([
        User.findByIdAndUpdate(userId, { $addToSet: { followers: currentUser._id } }),
        User.findByIdAndUpdate(currentUser._id, { $addToSet: { following: userId } }),
      ]);

      // Fetch updated target user
      const updatedUser = await User.findById(userId);
      return res.status(200).json({ message: "User followed successfully", updatedUser });
    }
  } catch (err) {
    console.error("Error in followAndUnfollowDialog:", err);
    res.status(500).json({ message: "Internal server error" });
  }
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
        await post.updateMany(
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

const freezeAccount = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findByIdAndUpdate(userId, { isFrozen: true }, { new: true });

        // Return updated user information to the frontend
        res.status(200).json({
            message: "Account frozen successfully",
            success: true
        });
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
            return res.status(404).json({ message: 'User not found' });
        }

        // Construct reset URL (no tokens, using email as a query parameter)
        const resetUrl = `${process.env.CLIENT_URL}/reset-action/${encodeURIComponent(
            user.id
        )}`;

        // Email content
        const mailOptions = {
            from: `"PixelPals Support Team" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Password Reset Request',
            html: `
          <p>Hello ${user.name || 'User'},</p>
          <p>You requested a password reset. Please click the link below to reset your password:</p>
          <a href="${resetUrl}" style="text-decoration:none; color: #fff; background-color: #007bff; padding: 10px 15px; border-radius: 5px;">Reset Password</a>
          <p>If you did not request this, please ignore this email.</p>
          <p>Thank you,</p>
          <p>Your App Team</p>
        `,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Reset link sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};


const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const { id } = req.params;
    
        // Find user by id (if you're using id for user lookup)
        const user = await User.findOne({ _id: id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate the password strength (optional but recommended)
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password is too short, minimum 6 characters.' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword; // Update the user's password

        // Save the updated user object
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ error: error.message || 'Something went wrong.' });
    }
};

const requestFollow = async (req, res) => 
    {
        try {
    const { userId } = req.body; // ID of the user sending the request
    const requestedUser = await User.findById(req.params.id);
    const sender = await User.findById(userId);

    if (!requestedUser || !sender) {
        return res.status(404).json({ message: "User not found" });
    }

    if (requestedUser.Requested.includes(userId)) {
        return res.status(400).json({ message: "Request already sent" });
    }

    requestedUser.Requested.push(userId);
    await requestedUser.save();

    res.status(200).json({ message: "Follow request sent" });
} catch (error) {
    res.status(500).json({ error: "Server error" });
}
}

const acceptFollow = async (req, res) => {
    try {
        const { userId } = req.body; // ID of the user being accepted
        const currentUser = await User.findById(req.params.id);
        const sender = await User.findById(userId);

        if (!currentUser || !sender) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!currentUser.Requested.includes(userId)) {
            return res.status(400).json({ message: "No follow request from this user" });
        }

        // Remove from requested array
        currentUser.Requested = currentUser.Requested.filter(id => id.toString() !== userId);
        
        // Add to followers list
        currentUser.followers.push(userId);
        sender.following.push(currentUser._id);

        await currentUser.save();
        await sender.save();

        res.status(200).json({ message: "Follow request accepted" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}

const rejectFollow = async (req, res) => {
    
        try {
            const { userId } = req.body; // ID of the user being declined
            const currentUser = await User.findById(req.params.id);
    
            if (!currentUser) {
                return res.status(404).json({ message: "User not found" });
            }
    
            // Remove from requested array
            currentUser.Requested = currentUser.Requested.filter(id => id.toString() !== userId);
            await currentUser.save();
    
            res.status(200).json({ message: "Follow request declined" });
        } catch (error) {
            res.status(500).json({ error: "Server error" });
        }
    }
    

export { signupUser, loginUser, logoutUser, followandUnfollowUser, privateAccount, getFollowersAndFollowing, followUnfollowDialog, updateProfile, getUserProfile, getSuggestedUsers, freezeAccount, resetLink, resetPassword, requestFollow, acceptFollow, rejectFollow };