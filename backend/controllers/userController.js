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
        const { id } = req.params;
        const { userId } = req.body;
        const user = await User.findById(userId);
        const currentUser = await User.findById(id);
        if (!user.followers.includes(id)) {
            await user.updateOne({ $push: { followers: id } });
            await currentUser.updateOne({ $push: { followings: userId } });
            res.status(200).json("user has been followed");
        } else {
            await user.updateOne({ $pull: { followers: id } });
            await currentUser.updateOne({ $pull: { followings: userId } });
            res.status(200).json("user has been unfollowed");
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

export { signupUser, loginUser, logoutUser, followandUnfollowUser }