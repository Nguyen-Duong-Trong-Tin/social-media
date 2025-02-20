"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const role_validate_1 = __importDefault(require("../../validates/admin/role.validate"));
const role_controller_1 = __importDefault(require("../../controllers/admin/role.controller"));
router.get("/", role_controller_1.default.get);
router.get("/detail/:id", role_controller_1.default.getById);
router.get("/create", role_controller_1.default.create);
router.post("/create", role_validate_1.default.createPost, role_controller_1.default.createPost);
router.get("/update/:id", role_controller_1.default.update);
router.patch("/update/:id", role_validate_1.default.updatePatch, role_controller_1.default.updatePatch);
router.patch("/actions", role_validate_1.default.actions, role_controller_1.default.actions);
router.delete("/delete/:id", role_controller_1.default.del);
exports.default = router;
