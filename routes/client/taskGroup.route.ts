import express, { Router } from "express";

import storage from "../../utils/storage.util";
import multerUtil from "../../utils/multer.util";

import deserialize from "../../middlewares/client/deserialize.middleware";
import taskGroupValidate from "../../validates/client/taskGroup.validate";
import taskGroupController from "../../controllers/client/taskGroup.controller";

const upload = multerUtil({ storage });
const router: Router = express.Router();

router.post(
  "/",
  deserialize,
  upload.fields([
    { name: "images", maxCount: 6 },
    { name: "videos", maxCount: 6 },
  ]),
  taskGroupValidate.create,
  taskGroupController.create
);

router.get("/", deserialize, taskGroupController.find);

export default router;
