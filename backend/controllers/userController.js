import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateAndSetCookies from "../utils/helper/generateAndSetCookies.js";


const signupUser=async(req,res)=>{
    try{
        const {name,username,email,password}=req.body;
        const user=await User.findOne({$or:[{email},{username}]})
        if(user)
        {
            return res.status(400).json({message:"User already exists"});
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser=new User({
            name,
            username,
            email,
            password:hashedPassword
        })
        if (newUser)
        {
            generateAndSetCookies(newUser._id, res);
        }
        const savedUser=await newUser.save();
        res.status(201).json({message:"User created successfully",user:savedUser});
    }
    catch(error){
        res.status(400).json({message:error.message});
    }
}

const loginUser=async(req,res)=>{
    try{
        const {email,password}=req.body;
        const user=await User.findOne({email});
        if(user && (await bcrypt.compare(password,user.password)))
        {
            generateAndSetCookies(user._id, res);
            return res.status(201).json({message:"Login successful",user});
        }
        else
        {
            return res.status(400).json({message:"Invalid credentials"});
        }
    }
    catch(error){
        res.status(400).json({message:error.message});
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


export { signupUser, loginUser, logoutUser, followandUnfollowUser }