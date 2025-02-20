import express, { Router } from "express";
const router: Router = express.Router();

import storage from "../../utils/storage.util";
import multerUtil from "../../utils/multer.util";
const upload = multerUtil({ storage });

import validate from "../../validates/admin/account.validate";
import controller from "../../controllers/admin/account.controller";

router.get("/", controller.get);
router.get("/detail/:id", controller.getById);

router.get("/create", controller.create);
router.post(
  "/create",
  upload.single("avatar"),
  validate.createPost,
  controller.createPost
);

router.get("/update/:id", controller.update);
router.patch(
  "/update/:id",
  upload.single("avatar"),
  validate.updatePatch,
  controller.updatePatch
);

router.patch(
  "/actions",
  validate.actions,
  controller.actions
);
router.patch(
  "/updateStatus/:status/:id",
  validate.updateStatus,
  controller.updateStatus
);

router.delete("/delete/:id", controller.del);

export default router;