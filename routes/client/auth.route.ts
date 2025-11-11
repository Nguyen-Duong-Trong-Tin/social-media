import express, { Router } from "express";
const router: Router = express.Router();

import authValidate from "../../validates/client/auth.validate";
import authController from "../../controllers/client/auth.controller";

router.post("/register", authValidate.register, authController.register);
router.post("/login", authValidate.login, authController.login);
router.get(
  "/verify-access-token",
  authValidate.verifyAccessToken,
  authController.verifyAccessToken
);
router.post(
  "/refresh-token",
  authValidate.refreshToken,
  authController.refreshToken
);

export default router;
