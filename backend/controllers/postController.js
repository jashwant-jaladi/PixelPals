
import Post from "../models/postModel.js";
import User from "../models/userModel.js";


const createPost = async (req, res) => {
    try {
        const postedBy = req.user._id;
        const { caption, image } = req.body;

        if (!postedBy || !caption) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }

        const user = await User.findById(postedBy);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user._id.toString() !== req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot post others profile" });
        }

        const maxlength = 500;
        if (caption.length > maxlength) {
            return res.status(400).json({ message: `Caption must be less than ${maxlength} characters` });
        }

        const newPost = new Post({
            postedBy,
            caption,
            image
        });

        const savedPost = await newPost.save();
        res.status(201).json({ message: "Post created successfully", post: savedPost });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



const getPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId).populate("postedBy");
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json({ message: "Post fetched successfully", post });
    } catch (error) {
        console.error("Error getting post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
export { createPost, getPost, deletePost }
