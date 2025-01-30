import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import { v2 as cloudinary } from "cloudinary";
import { getRecipientSocketId, io } from "../socket/socket.js";
import {HfInference} from "@huggingface/inference";


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



async function generateCohereResponse(req, res) {
	const { mood, text } = req.body;
    const prompt = `rephrase the following sentence/question in ${mood} tone: ${text}`;
;

	try {
		const response = await fetch('https://api.cohere.ai/generate', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + process.env.COHERE_API_KEY
			},
			body: JSON.stringify({ prompt, temperature: 0.5, max_tokens: 100 })
		});

		const data = await response.json();
		const generatedText = data.text
		res.status(200).json({ suggestion: generatedText });
	} catch (error) {
		console.error('Error generating response:', error);
		res.status(500).json({ error: 'Failed to generate response' });
	}
}


  
 async function analyseMessage(req, res) {
	return generateCohereResponse(req, res);
  }

  async function markMessageAsSeen(req, res) {
	try {
		const { messageId } = req.body;
		const userId = req.user._id;

		const message = await Message.findById(messageId);
		if (!message) {
			return res.status(404).json({ error: "Message not found" });
		}

		// Ensure only the recipient can mark it as seen
		const conversation = await Conversation.findById(message.conversationId);
		if (!conversation.participants.includes(userId)) {
			return res.status(403).json({ error: "Unauthorized" });
		}

		// Update the seen status
		message.seen = true;
		await message.save();

		// Notify the sender in real time
		const senderSocketId = getRecipientSocketId(message.sender);
		if (senderSocketId) {
			io.to(senderSocketId).emit("messageSeen", { messageId });
		}

		res.status(200).json({ success: true });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

const messageSeenCount = async (req, res) => {
	try {
	  const { userId } = req.params;
	  const unreadCount = await Message.countDocuments({
		recipient: userId, 
		seen: false,
	  });
	  res.json({ unreadCount });
	} catch (error) {
	  res.status(500).json({ error: "Failed to fetch unread messages count" });
	}
  }


export { sendMessage, getMessages, getConversations, analyseMessage, markMessageAsSeen, messageSeenCount };