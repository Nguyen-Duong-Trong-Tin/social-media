import express, { Router } from "express";
const router: Router = express.Router();

import deserialize from "../../middlewares/client/deserialize.middleware";
import articleUserController from "../../controllers/client/articleUser.controller";
import multerUtil from "../../utils/multer.util";
import storage from "../../utils/storage.util";

const upload = multerUtil({ storage });

router.get("/", deserialize, articleUserController.find);
router.get("/slug/:slug", deserialize, articleUserController.findBySlug);
router.get("/:id", deserialize, articleUserController.findById);
router.post(
	"/",
	deserialize,
	upload.fields([
		{ name: "images", maxCount: 6 },
		{ name: "videos", maxCount: 6 },
	]),
	articleUserController.create
);
router.patch(
	"/:id",
	deserialize,
	upload.fields([
		{ name: "images", maxCount: 6 },
		{ name: "videos", maxCount: 6 },
	]),
	articleUserController.update
);
router.delete("/:id", deserialize, articleUserController.del);

export default router;
