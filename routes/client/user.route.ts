import express, { Router } from "express";
const router: Router = express.Router();

import deserialize from "../../middlewares/client/deserialize.middleware";

import userValidate from "../../validates/client/user.validate";
import userController from "../../controllers/client/user.controller";

router.post(
  "/check-exists/email",
  userValidate.checkExistsEmail,
  userController.checkExistsEmail
);
router.post(
  "/check-exists/phone",
  userValidate.checkExistsPhone,
  userController.checkExistsPhone
);
router.post("/ids", deserialize, userController.findUsersByIds);

router.get("/", deserialize, userController.findUsers);
router.get("/slug/:slug", deserialize, userController.findUserBySlug);

router.patch(
  "/bio/:id",
  deserialize,
  userValidate.updateBio,
  userController.updateBio
);

export default router;
