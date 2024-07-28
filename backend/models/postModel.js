import { text } from "express";
import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    postedBy: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    caption: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    likes: {
        type: number,
        default: 0
    },
    comments: [
        {
        userId: {
            type:[mongoose.Schema.Types.ObjectId],
            ref: "User",
            required: true
        },
        text: {
            type: String,
            required: true
        },
        userProfilePic: {
            type: String
        },
        usernamr: {
            type: String
        }
        }
    ]
}, {timestamps: true})          

const post=mongoose.model("Post", postSchema)

export default post