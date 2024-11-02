
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import {v2 as cloudinary} from "cloudinary";

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

        const savedPost = await newPost.save();
        res.status(201).json({ message: "Post created successfully", post: savedPost });
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
        res.status(200).json({ message: "Post fetched successfully", post });
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
    try{
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        if (post.likes.includes(req.user._id)) {
            await post.updateOne({ $pull: { likes: req.user._id } });
            return res.status(200).json({ message: "Post unliked successfully" });
        }
        await post.updateOne({ $push: { likes: req.user._id } });
        res.status(200).json({ message: "Post liked successfully" });
    }
    catch(err){
        res.status(404).json({ error: err.message });
    }
}

const commentPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { text } = req.body;
        const userId = req.user._id;
        const profilePic = req.user.profilePic; // Ensure this is correctly populated
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
            postedBy: userId,
            profilePic, 
            username
        };

        post.comments.push(comment);
        await post.save();

        res.status(200).json({ message: "Comment added successfully", post });
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

export { createPost, getPost, deletePost, likeAndUnlikePost, commentPost, getFeedPosts, getUserPosts };
