import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getMessages, sendMessage, getConversations, analyseMessage} from "../controllers/messageController.js";

const router = express.Router();

router.get("/conversations", protectRoute, getConversations);
router.get("/:otherUserId", protectRoute, getMessages);
router.post("/", protectRoute, sendMessage);
router.post("/analyzeMood", protectRoute, analyseMessage);


export default router;