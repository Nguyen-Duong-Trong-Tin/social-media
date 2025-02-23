"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const permission_validate_1 = __importDefault(require("../../validates/admin/permission.validate"));
const permission_controller_1 = __importDefault(require("../../controllers/admin/permission.controller"));
router.get("/", permission_controller_1.default.get);
router.patch("/update", permission_validate_1.default.updatePatch, permission_controller_1.default.updatePatch);
exports.default = router;
