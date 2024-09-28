import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateAndSetCookies from "../utils/helper/generateAndSetCookies.js";
import { v2 as cloudinary } from "cloudinary";


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

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }

        // Handle profilePic if present in the request
        if (profilePic && profilePic !== user.profilePic) {
            // Remove old profile picture from Cloudinary if it exists
            if (user.profilePic) {
                try {
                    const publicId = user.profilePic.split("/").pop().split(".")[0];
                    console.log('Deleting old profile pic:', publicId);
                    await cloudinary.uploader.destroy(publicId);
                } catch (deleteError) {
                    console.error("Error deleting old profile picture:", deleteError.message);
                }
            }

            // Upload new profile picture
            try {
                const uploadedResponse = await cloudinary.uploader.upload(profilePic, {
                    upload_preset: "social_media",
                });
                profilePic = uploadedResponse.secure_url;
            } catch (uploadError) {
                console.error("Error uploading new profile picture:", uploadError.message);
                return res.status(500).json({ error: "Error uploading new profile picture" });
            }
        } else if (!profilePic) {
            // If no new profilePic is provided, keep the old one
            profilePic = user.profilePic;
        }

        // Update user details
        user.name = name || user.name;
        user.email = email || user.email;
        user.username = username || user.username;
        user.profilePic = profilePic || user.profilePic;
        user.bio = bio || user.bio;

        user = await user.save();
        user.password = null; // Do not send the password in the response

        res.status(200).json(user); // Send the complete user object back
    } catch (err) {
        console.error("Error in updateUser: ", err.message);
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
export { signupUser, loginUser, logoutUser, followandUnfollowUser, updateProfile, getUserProfile }