
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import {v2 as cloudinary} from "cloudinary";
import Notification from "../models/notificationModel.js";

const createPost = async (req, res) => {
    try {
        const postedBy = req.user._id;
        const { caption, image } = req.body;

        if (!postedBy || !caption) {
            return res.status(400).json({ error: "Please fill all the fields" });
        }

        const user = await User.findById(postedBy);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user._id.toString() !== req.user._id.toString()) {
            return res.status(400).json({ error: "You cannot post on others' profiles" });
        }

        const maxlength = 500;
        if (caption.length > maxlength) {
            return res.status(400).json({ error: `Caption must be less than ${maxlength} characters` });
        }

        let imageUrl = null;
        
        if (image) {
            // Assuming image is a base64 string
            const base64Image = image.split(';base64,').pop(); // Get the base64 string without the prefix
            let uploadedResponse = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Image}`); // Prefix with appropriate MIME type
            imageUrl = uploadedResponse.secure_url;
        }

        const newPost = new Post({
            postedBy,
            caption,
            image: imageUrl
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


const getPost = async (req, res) => {
    
    try {
    
        const postId = req.params.id;
        const post = await Post.findById(postId).populate("postedBy");
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        res.status(200).json(post);
    } catch (error) {
        console.error("Error getting post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (post.image) {
			const imgId = post.image.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}
        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: "Post deleted successfully" });

    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const likeAndUnlikePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (post.likes.includes(userId)) {
            await post.updateOne({ $pull: { likes: userId } });
            return res.status(200).json({ message: "Post unliked successfully" });
        }

        await post.updateOne({ $push: { likes: userId } });

        // Send notification only if the liker is not the post owner
        if (post.postedBy.toString() !== userId.toString()) {
            await Notification.create({
                recipient: post.postedBy,
                sender: userId,
                type: "like",
                post: postId,
                message: "liked your post",
            });
        }

        res.status(200).json({ message: "Post liked successfully" });
    } catch (err) {
        console.error("Error liking/unliking post:", err);
        res.status(500).json({ error: err.message });
    }
};

const commentPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { text } = req.body;
        const userId = req.user._id;
        const profilePic = req.user.profilePic; 
        const username = req.user.username;

        if (!text) {
            return res.status(400).json({ error: "Please fill all the fields" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = {
            text,
            userId,
            profilePic,
            username
        };

        post.comments.push(comment);
        await post.save();

        // Send notification only if commenter is not the post owner
        if (post.postedBy.toString() !== userId.toString()) {
            await Notification.create({
                recipient: post.postedBy,
                sender: userId,
                type: "comment",
                post: postId,
                message: "commented on your post",
            });
        }

        res.status(200).json(comment);
    } catch (err) {
        console.error("Error adding comment:", err);
        res.status(500).json({ error: err.message });
    }
};



const getFeedPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const following = user.following;

        // Modify the populate to select specific fields
        const posts = await Post.find({ postedBy: { $in: following } })
            .populate("postedBy", "name profilePic username"); // Add desired fields here

        res.status(200).json({ message: "Posts fetched successfully", posts });
    } catch (error) {
        console.error("Error getting feed posts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const getUserPosts = async (req, res) => {
    try {
        const username = req.params.username;   
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const posts = await Post.find({ postedBy: user._id })
                        .populate("postedBy", "username profilePic")
                        .sort({ createdAt: -1 });

        res.status(200).json({ message: "Posts fetched successfully", posts });
    } catch (error) {
        console.error("Error getting user posts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}


const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const notifications = await Notification.find({ recipient: userId, isRead: false }) // Fetch only unread notifications
            .sort({ createdAt: -1 })
            .populate("sender", "username profilePic");

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const updatedNotification = await Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true } 
        );

        if (!updatedNotification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;

        // Find the post
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: "Post not found" });

        // Check if the comment exists in the post
        const commentExists = post.comments.some((comment) => comment._id.toString() === commentId);
        if (!commentExists) return res.status(404).json({ error: "Comment not found" });

        // Remove the comment
        await Post.findByIdAndUpdate(postId, { $pull: { comments: { _id: commentId } } });

        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export { createPost, getPost, deletePost, likeAndUnlikePost, commentPost,deleteComment, getFeedPosts, getUserPosts, getNotifications, markNotificationAsRead };
