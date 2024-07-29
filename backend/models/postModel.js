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
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        ref: "User"
        
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