import express, { Router } from "express";
const router: Router = express.Router();

import groupValidate from "../../validates/client/group.validate";
import groupController from "../../controllers/client/group.controller";
import deserialize from "../../middlewares/client/deserialize.middleware";
import multerUtil from "../../utils/multer.util";
import storage from "../../utils/storage.util";

const upload = multerUtil({ storage });

router.get("/", deserialize, groupController.find);
router.get("/:id", deserialize, groupController.findById);
router.get("/suggest/:userId", deserialize, groupController.findSuggest);
router.get("/slug/:slug", deserialize, groupController.findBySlug);

router.post(
  "/",
  deserialize,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
  ]),
  groupValidate.create,
  groupController.create
);
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
router.patch(
  "/change-user-role/:role/:userId/:id",
  deserialize,
  groupController.changeUserRole
);

router.delete("/leave/:userId/:id", deserialize, groupController.leaveGroup);

export default router;
