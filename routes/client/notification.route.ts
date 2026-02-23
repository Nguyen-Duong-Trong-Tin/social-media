import express, { Router } from "express";
const router: Router = express.Router();

import deserialize from "../../middlewares/client/deserialize.middleware";
import notificationController from "../../controllers/client/notification.controller";

router.get("/", deserialize, notificationController.find);
router.get("/unread-count", deserialize, notificationController.unreadCount);
router.patch("/mark-read", deserialize, notificationController.markRead);

export default router;
