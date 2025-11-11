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
router.get("/", deserialize_middleware_1.default, group_controller_1.default.find);
router.get("/slug/:slug", deserialize_middleware_1.default, group_controller_1.default.findBySlug);
router.post("/invite-member/:userId/:id", deserialize_middleware_1.default, group_controller_1.default.inviteMember);
router.post("/invite-member/accept/:userId/:id", deserialize_middleware_1.default, group_controller_1.default.inviteMemberAccept);
router.post("/invite-member/reject/:userId/:id", deserialize_middleware_1.default, group_controller_1.default.inviteMemberReject);
router.patch("/description/:id", deserialize_middleware_1.default, group_validate_1.default.updateDescription, group_controller_1.default.updateDescription);
router.patch("/invitation/:id", deserialize_middleware_1.default, group_validate_1.default.updateInvitation, group_controller_1.default.updateInvitation);
exports.default = router;
