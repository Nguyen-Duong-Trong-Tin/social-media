import express, { Router } from "express";
const router: Router = express.Router();

import deserialize from "../../middlewares/client/deserialize.middleware";
import messageController from "../../controllers/client/message.controller";

router.get("/", deserialize, messageController.find);

export default router;
