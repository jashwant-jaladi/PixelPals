import User from "../models/userModel.js";




const requestFollow = async (req, res) => {
    try {
        const { userId } = req.body; // ID of the user sending the request
        const requestedUser = await User.findById(req.params.id);
        const sender = await User.findById(userId);

        if (!requestedUser || !sender) {
            return res.status(404).json({ message: "User not found" });
        }

        if (userId === req.params.id) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        if (requestedUser.Requested.includes(userId)) {
            return res.status(400).json({ message: "Follow request already sent" });
        }

        requestedUser.Requested = requestedUser.Requested || [];
        requestedUser.Requested.push(userId);
        await requestedUser.save();

        res.status(200).json({ message: "Follow request sent" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

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

        // Prevent duplicate followers
        if (!currentUser.followers.includes(userId)) {
            currentUser.followers.push(userId);
        }
        if (!sender.following.includes(currentUser._id.toString())) {
            sender.following.push(currentUser._id);
        }

        await currentUser.save();
        await sender.save();

        res.status(200).json({ message: "Follow request accepted" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

const rejectFollow = async (req, res) => {
    try {
        const { userId } = req.body; // ID of the user being declined
        const currentUser = await User.findById(req.params.id);

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!currentUser.Requested.includes(userId)) {
            return res.status(400).json({ message: "No follow request from this user" });
        }

        // Remove from requested array
        currentUser.Requested = currentUser.Requested.filter(id => id.toString() !== userId);
        await currentUser.save();

        res.status(200).json({ message: "Follow request declined" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

const followandUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params; // ID of the user to follow/unfollow
        const currentUser = req.user; // Authenticated user from middleware

        if (id === currentUser._id.toString()) {
            return res.status(400).json({ success: false, message: "You cannot follow yourself" });
        }

        // Find target user
        const targetUser = await User.findById(id);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: "Target user not found" });
        }

        const isFollowing = targetUser.followers.includes(currentUser._id);

        // 🔥 Optimized: Use Promise.all to update both users simultaneously
        const [updatedTargetUser, updatedCurrentUser] = await Promise.all([
            User.findByIdAndUpdate(
                id,
                isFollowing ? { $pull: { followers: currentUser._id } } : { $addToSet: { followers: currentUser._id } },
                { new: true }
            ),
            User.findByIdAndUpdate(
                currentUser._id,
                isFollowing ? { $pull: { following: id } } : { $addToSet: { following: id } },
                { new: true }
            ),
        ]);

        return res.status(200).json({
            success: true,
            message: isFollowing ? "User unfollowed successfully" : "User followed successfully",
            isFollowing: !isFollowing,
            updatedFollowers: updatedTargetUser.followers
        });

    } catch (err) {
        console.error("Error in followAndUnfollowUser:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
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





export { requestFollow, acceptFollow, rejectFollow, followandUnfollowUser, getFollowersAndFollowing};