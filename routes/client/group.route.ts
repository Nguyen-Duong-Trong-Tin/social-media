import express, { Router } from "express";
const router: Router = express.Router();

import groupValidate from "../../validates/client/group.validate";
import groupController from "../../controllers/client/group.controller";
import deserialize from "../../middlewares/client/deserialize.middleware";

router.get("/", deserialize, groupController.find);
router.get("/slug/:slug", deserialize, groupController.findBySlug);

router.post(
  "/invite-member/:userId/:id",
  deserialize,
  groupController.inviteMember
);
router.post(
  "/invite-member/accept/:userId/:id",
  deserialize,
  groupController.inviteMemberAccept
);
router.post(
  "/invite-member/reject/:userId/:id",
  deserialize,
  groupController.inviteMemberReject
);

router.patch(
  "/description/:id",
  deserialize,
  groupValidate.updateDescription,
  groupController.updateDescription
);
router.patch(
  "/invitation/:id",
  deserialize,
  groupValidate.updateInvitation,
  groupController.updateInvitation
);

export default router;
