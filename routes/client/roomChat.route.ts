import express, { Router } from "express";
const router: Router = express.Router();

import deserialize from "../../middlewares/client/deserialize.middleware";
import roomChatController from "../../controllers/client/roomChat.controller";

router.get(
  "/ai-assistant/:userId",
  deserialize,
  roomChatController.findByAiAssistantAndUserId
);

export default router;
