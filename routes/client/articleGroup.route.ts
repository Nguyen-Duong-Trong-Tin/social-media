import express, { Router } from "express";
const router: Router = express.Router();

import deserialize from "../../middlewares/client/deserialize.middleware";
import articleGroupController from "../../controllers/client/articleGroup.controller";
import multerUtil from "../../utils/multer.util";
import storage from "../../utils/storage.util";

const upload = multerUtil({ storage });

router.get("/", deserialize, articleGroupController.find);
router.get("/slug/:slug", deserialize, articleGroupController.findBySlug);
router.get("/:id", deserialize, articleGroupController.findById);
router.post(
  "/",
  deserialize,
  upload.fields([
    { name: "images", maxCount: 6 },
    { name: "videos", maxCount: 6 },
  ]),
  articleGroupController.create
);
router.patch(
  "/:id",
  deserialize,
  upload.fields([
    { name: "images", maxCount: 6 },
    { name: "videos", maxCount: 6 },
  ]),
  articleGroupController.update
);
router.delete("/:id", deserialize, articleGroupController.del);

export default router;
