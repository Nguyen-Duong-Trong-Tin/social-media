"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const groupTopic_validate_1 = __importDefault(require("../../validates/admin/groupTopic.validate"));
const groupTopic_controller_1 = __importDefault(require("../../controllers/admin/groupTopic.controller"));
router.get("/", groupTopic_controller_1.default.get);
router.get("/detail/:id", groupTopic_controller_1.default.getById);
router.get("/create", groupTopic_controller_1.default.create);
router.post("/create", groupTopic_validate_1.default.createPost, groupTopic_controller_1.default.createPost);
router.get("/update/:id", groupTopic_controller_1.default.update);
router.patch("/update/:id", groupTopic_validate_1.default.updatePatch, groupTopic_controller_1.default.updatePatch);
router.patch("/actions", groupTopic_validate_1.default.actions, groupTopic_controller_1.default.actions);
router.delete("/delete/:id", groupTopic_controller_1.default.del);
exports.default = router;
