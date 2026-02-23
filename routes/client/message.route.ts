import express, { Router } from "express";
const router: Router = express.Router();

import deserialize from "../../middlewares/client/deserialize.middleware";
import messageController from "../../controllers/client/message.controller";
import multer from "../../utils/multer.util";
import storage from "../../utils/storage.util";

const upload = multer({ storage });

router.get("/", deserialize, messageController.find);
router.post(
	"/upload-images",
	deserialize,
	upload.array("images", 6),
	messageController.uploadImages
);
router.post(
	"/upload-videos",
	deserialize,
	upload.array("videos", 6),
	messageController.uploadVideos
);
router.post(
	"/upload-materials",
	deserialize,
	upload.array("materials", 6),
	messageController.uploadMaterials
);

export default router;
