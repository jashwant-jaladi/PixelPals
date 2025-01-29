import mongoose, { model } from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profilePic: {
        type: String,
        default: ""
    },
    followers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref : "User",
        default: []
    },
    following: {
        type: [mongoose.Schema.Types.ObjectId],
        ref : "User",
        default: []
    },
    bio: {
        type: String,
        default: ""
    },
    isFrozen: {
        type: Boolean,
        default: false
    }
    
}, {timestamps: true});

const User=mongoose.model('User', userSchema)

export default User