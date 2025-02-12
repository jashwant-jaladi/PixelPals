import User from "../models/userModel.js";




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

    const followandUnfollowUser = async (req, res) => {
        try {
            const { id } = req.params; // ID of the user to follow/unfollow
            const currentUser = req.user; // Authenticated user from middleware
    
            if (id === currentUser._id.toString()) {
                return res.status(400).json({ message: "You cannot follow yourself" });
            }
    
            const targetUser = await User.findById(id);
            if (!targetUser) {
                return res.status(404).json({ message: "Target user not found" });
            }
    
            const isFollowing = targetUser.followers.includes(currentUser._id);
    
            // Use transactions for atomic updates (recommended)
            const session = await User.startSession();
            session.startTransaction();
    
            if (isFollowing) {
                // Unfollow
                await User.findByIdAndUpdate(id, { $pull: { followers: currentUser._id } }, { new: true, session });
                await User.findByIdAndUpdate(currentUser._id, { $pull: { following: id } }, { new: true, session });
                await session.commitTransaction();
                session.endSession();
    
                return res.status(200).json({ success: true, message: "User unfollowed successfully", isFollowing: false });
            } else {
                // Follow
                await User.findByIdAndUpdate(id, { $push: { followers: currentUser._id } }, { new: true, session });
                await User.findByIdAndUpdate(currentUser._id, { $push: { following: id } }, { new: true, session });
                await session.commitTransaction();
                session.endSession();
    
                return res.status(200).json({ success: true, message: "User followed successfully", isFollowing: true });
            }
        } catch (err) {
            console.error("Error in followAndUnfollowUser:", err);
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
    

    export { requestFollow, acceptFollow, rejectFollow, followandUnfollowUser, getFollowersAndFollowing, followUnfollowDialog };