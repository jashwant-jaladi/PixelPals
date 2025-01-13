import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import { v2 as cloudinary } from "cloudinary";
import { getRecipientSocketId, io } from "../socket/socket.js";

async function sendMessage(req, res) {
	try {
		const { recipientId, message } = req.body;
		let { img } = req.body;
		const senderId = req.user._id;

		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, recipientId] },
		});

		if (!conversation) {
			conversation = new Conversation({
				participants: [senderId, recipientId],
				lastMessage: {
					text: message,
					sender: senderId,
				},
			});
			await conversation.save();
		}

		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
		}

		const newMessage = new Message({
			conversationId: conversation._id,
			sender: senderId,
			text: message,
			img: img || "",
		});

		await Promise.all([
			newMessage.save(),
			conversation.updateOne({
				lastMessage: {
					text: message,
					sender: senderId,
				},
			}),
		]);

		const recipientSocketId = getRecipientSocketId(recipientId);
		if (recipientSocketId) {
			io.to(recipientSocketId).emit("newMessage", newMessage);
		}
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

async function getMessages(req, res) {
	const { otherUserId } = req.params;
	const userId = req.user._id;
	try {
		const conversation = await Conversation.findOne({
			participants: { $all: [userId, otherUserId] },
		});

		if (!conversation) {
			return res.status(404).json({ error: "Conversation not found" });
		}

		const messages = await Message.find({
			conversationId: conversation._id,
		}).sort({ createdAt: 1 });

		res.status(200).json(messages);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

async function getConversations(req, res) {
	const userId = req.user._id;
	try {
		const conversations = await Conversation.find({ participants: userId }).populate({
			path: "participants",
			select: "username profilePic",
		});

		// remove the current user from the participants array
		conversations.forEach((conversation) => {
			conversation.participants = conversation.participants.filter(
				(participant) => participant._id.toString() !== userId.toString()
			);
		});
		res.status(200).json(conversations);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

// Utility function to handle OpenAI API requests
async function handleOpenAIRequest(req, res, promptType) {
    try {
        const { text, mood } = req.body; 
        console.log(text, mood); 
    
        const prompt = promptType === "analyse"
            ? `Analyze this message based on the mood "${mood}": "${text}"`
            : `Suggest an alternative for this message with the mood "${mood}": "${text}"`;

        // Make the API request to OpenAI
        const response = await fetch("https://api.openai.com/v1/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
			body: JSON.stringify({
				model: "gpt-3.5-turbo", // updated model
				prompt,
				max_tokens: 100,
			  }),
        });

        // Parse response from OpenAI
        const data = await response.json();
		console.log(data);
        if (response.ok && data.choices?.[0]?.text) {
            res.status(200).json({ result: data.choices[0].text.trim() });
        } else {
            throw new Error("Failed to fetch response from OpenAI");
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


 async function analyseMessage(req, res) {
    return handleOpenAIRequest(req, res, "analyse");
}


export { sendMessage, getMessages, getConversations, analyseMessage };