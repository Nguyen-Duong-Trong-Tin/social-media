import express, { Router } from "express";

import storage from "../../utils/storage.util";
import multerUtil from "../../utils/multer.util";
import deserialize from "../../middlewares/client/deserialize.middleware";
import taskGroupSubmissionValidate from "../../validates/client/taskGroupSubmission.validate";
import taskGroupSubmissionController from "../../controllers/client/taskGroupSubmission.controller";

const router: Router = express.Router();
const upload = multerUtil({ storage });

router.get("/", deserialize, taskGroupSubmissionController.find);
router.get(
  "/slug/:slug",
  deserialize,
  taskGroupSubmissionController.findBySlug
);

router.post(
  "/find-by-user-id-and-task-group-ids",
  deserialize,
  taskGroupSubmissionController.findByUserIdAndTaskGroupIds
);

router.post(
  "/submit",
  deserialize,
  upload.fields([
    { name: "images", maxCount: 6 },
    { name: "videos", maxCount: 6 },
    { name: "materials", maxCount: 6 },
  ]),
  taskGroupSubmissionValidate.submit,
  taskGroupSubmissionController.submit
);

router.patch(
  "/scoring/:id",
  deserialize,
  taskGroupSubmissionValidate.scoring,
  taskGroupSubmissionController.scoring
);

export default router;
