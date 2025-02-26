import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";



const requestFollow = async (req, res) => {
    try {
        console.log("Request received:", req.body, req.params);

        const { userId } = req.body;  
        const requestedUserId = req.params.id;

        if (!requestedUserId || !userId) {
            return res.status(400).json({ message: "Invalid request. User ID required." });
        }

        const requestedUser = await User.findById(requestedUserId);
        const sender = await User.findById(userId);

        if (!requestedUser || !sender) {
            return res.status(404).json({ message: "User not found" });
        }

      

        if (userId === requestedUserId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        requestedUser.Requested = requestedUser.Requested || [];
        if (requestedUser.Requested.includes(userId)) {
            return res.status(400).json({ message: "Follow request already sent" });
        }

        requestedUser.Requested.push(userId);
        await requestedUser.save();

        console.log("Follow request successfully sent");
        res.status(200).json({ success: true, message: "Follow request sent" });
    } catch (error) {
        console.error("Error in requestFollow:", error);
        res.status(500).json({ error: "Server error" });
    }
};



const acceptFollow = async (req, res) => {
    try {
        const { userId } = req.body; // User being accepted
        const currentUser = await User.findById(req.params.id);
        const sender = await User.findById(userId);

        if (!currentUser || !sender) {
            return res.status(404).json({ message: "User not found" });
        }

        // Ensure request exists
        if (!currentUser.Requested.includes(userId.toString())) {
            return res.status(400).json({ message: "No follow request from this user" });
        }

        // Remove from requested array
        currentUser.Requested = currentUser.Requested.filter(id => id.toString() !== userId.toString());

        // Prevent duplicate followers
        if (!currentUser.followers.includes(userId.toString())) {
            currentUser.followers.push(userId.toString());
        }
        if (!sender.following.includes(currentUser._id.toString())) {
            sender.following.push(currentUser._id.toString());
        }

        const notification = new Notification({
            recipient: userId, // The user who sent the request
            sender: currentUser._id, // The user who accepted the request
            type: "follow_accept",
            message: `accepted your follow request.`,
            // No post reference needed for follow notifications
        });

        await Promise.all([currentUser.save(), sender.save(), notification.save()]);

        res.status(200).json({ 
            message: "Follow request accepted", 
            updatedUser: currentUser 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};


    const rejectFollow = async (req, res) => {
        try {
            const { userId } = req.body;
            const currentUser = await User.findById(req.params.id);

            if (!currentUser) {
                return res.status(404).json({ message: "User not found" });
            }

            // Ensure request exists before rejecting
            if (!currentUser.Requested.includes(userId.toString())) {
                return res.status(400).json({ message: "No follow request from this user" });
            }

            // Remove from requested array
            currentUser.Requested = currentUser.Requested.filter(id => id.toString() !== userId.toString());

            const notification = new Notification({
                recipient: userId, // The user who sent the request
                sender: currentUser._id, // The user who rejected the request
                type: "follow_reject",
                message: `declined your follow request.`,
                // No post reference needed for follow notifications
            });

            // Save changes
            await Promise.all([
                currentUser.save(),
                notification.save()
            ]);
            

            // Fetch the updated user after rejecting
            const updatedUser = await User.findById(req.params.id).select("Requested");

            res.status(200).json({ 
                message: "Follow request declined",
                updatedUser
            });
        } catch (error) {
            console.error(error);
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
            .populate("followers", "name profilePic username Requested")
            .populate("following", "name profilePic username Requested");

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



 const cancelFollowRequest = async (req, res) => {
  try {
    const { userId } = req.body; // ID of the user whose request we are canceling
    const currentUserId = req.user._id; // ID of the logged-in user

    // Find the target user (the one who received the follow request)
    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    // Remove currentUserId from the target user's "Requested" array
    targetUser.Requested = targetUser.Requested.filter(
      (id) => id.toString() !== currentUserId.toString()
    );

    await targetUser.save();

    // Return success response
    res.status(200).json({ success: true, message: "Follow request canceled." });
  } catch (error) {
    console.error("Error canceling follow request:", error);
    res.status(500).json({ error: error.message });
  }
};





export { requestFollow, acceptFollow, rejectFollow, cancelFollowRequest, followandUnfollowUser, getFollowersAndFollowing};