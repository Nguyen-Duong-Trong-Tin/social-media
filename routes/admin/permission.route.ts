import express, { Router } from "express";
const router: Router = express.Router();

import validate from "../../validates/admin/permission.validate";
import controller from "../../controllers/admin/permission.controller";

router.get("/", controller.get);

router.patch(
  "/update",
  validate.updatePatch,
  controller.updatePatch
);

export default router;