import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateAndSetCookies from "../utils/helper/generateAndSetCookies.js";


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
    const { name, username, email, password, bio } = req.body;
    let { profilePic } = req.body;
    try {
        const user = await User.findById(req.user._id);
        if (req.params.id !== req.user._id.toString()) {
            return res.status(401).json({ message: "You can update only your profile" });
        }
        if (user) {
            if (password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                user.password = hashedPassword;
            }
            user.name = name || user.name;
            user.username = username || user.username;
            user.email = email || user.email;
            user.profilePic = profilePic || user.profilePic;
            user.bio = bio || user.bio;
            const updatedUser = await user.save();
            res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
            if(profilePic){
                if(user.profilePic){
                    await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
                }
                const uploadedResponse = await cloudinary.uploader.upload(profilePic, {
                    upload_preset: "social_media",
                })
                profilePic = uploadedResponse.secure_url;
            }
        }
        else {
            res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}

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