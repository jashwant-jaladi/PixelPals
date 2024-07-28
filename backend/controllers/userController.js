import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
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
        const savedUser=await newUser.save();
        res.status(201).json({message:"User created successfully",user:savedUser});
    }
    catch(error){
        res.status(400).json({message:error.message});
    }
}


export { signupUser }