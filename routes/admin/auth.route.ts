import express, { Router } from "express";
const router: Router = express.Router();

import validate from "../../validates/admin/auth.validate";
import controller from "../../controllers/admin/auth.controller";

router.get("/login", controller.login);
router.post(
  "/login",
  validate.loginPost,
  controller.loginPost
);
router.post("/logout", controller.logoutPost);

export default router;