import express, { Router } from "express";
const router: Router = express.Router();

import validate from "../../validates/admin/role.validate";
import controller from "../../controllers/admin/role.controller";

router.get("/", controller.get);
router.get("/detail/:id", controller.getById);

router.get("/create", controller.create);
router.post(
  "/create",
  validate.createPost,
  controller.createPost
);

router.get("/update/:id", controller.update);
router.patch(
  "/update/:id", 
  validate.updatePatch,
  controller.updatePatch
);

router.patch(
  "/actions",
  validate.actions,
  controller.actions
);

router.delete("/delete/:id", controller.del);

export default router;