import express, { Router } from "express";
const router: Router = express.Router();

import deserialize from "../../middlewares/client/deserialize.middleware";
import roomChatController from "../../controllers/client/roomChat.controller";

router.get(
  "/ai-assistant/:groupId/:userId",
  deserialize,
  roomChatController.findByAiAssistantAndUserId
);

router.get(
  "/group/:groupId/:userId",
  deserialize,
  roomChatController.findByGroupId
);

router.get(
  "/user/:userId",
  deserialize,
  roomChatController.findByUserId
);

export default router;
