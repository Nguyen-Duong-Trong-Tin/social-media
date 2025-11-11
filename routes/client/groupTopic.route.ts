import express, { Router } from "express";
const router: Router = express.Router();

import deserialize from "../../middlewares/client/deserialize.middleware";
import groupTopicController from "../../controllers/client/groupTopic.controller";

router.get("/", deserialize, groupTopicController.find);
router.get("/:id", deserialize, groupTopicController.findById);
router.get("/slug/:slug", deserialize, groupTopicController.findBySlug);

export default router;
