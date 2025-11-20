"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const group_validate_1 = __importDefault(require("../../validates/client/group.validate"));
const group_controller_1 = __importDefault(require("../../controllers/client/group.controller"));
const deserialize_middleware_1 = __importDefault(require("../../middlewares/client/deserialize.middleware"));
const multer_util_1 = __importDefault(require("../../utils/multer.util"));
const storage_util_1 = __importDefault(require("../../utils/storage.util"));
const upload = (0, multer_util_1.default)({ storage: storage_util_1.default });
router.get("/", deserialize_middleware_1.default, group_controller_1.default.find);
router.get("/slug/:slug", deserialize_middleware_1.default, group_controller_1.default.findBySlug);
router.post("/", deserialize_middleware_1.default, upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
]), group_validate_1.default.create, group_controller_1.default.create);
router.post("/invite-member/:userId/:id", deserialize_middleware_1.default, group_controller_1.default.inviteMember);
router.post("/invite-member/accept/:userId/:id", deserialize_middleware_1.default, group_controller_1.default.inviteMemberAccept);
router.post("/invite-member/reject/:userId/:id", deserialize_middleware_1.default, group_controller_1.default.inviteMemberReject);
router.patch("/description/:id", deserialize_middleware_1.default, group_validate_1.default.updateDescription, group_controller_1.default.updateDescription);
router.patch("/invitation/:id", deserialize_middleware_1.default, group_validate_1.default.updateInvitation, group_controller_1.default.updateInvitation);
router.patch("/change-user-role/:role/:userId/:id", deserialize_middleware_1.default, group_controller_1.default.changeUserRole);
router.delete("/leave/:userId/:id", deserialize_middleware_1.default, group_controller_1.default.leaveGroup);
exports.default = router;
