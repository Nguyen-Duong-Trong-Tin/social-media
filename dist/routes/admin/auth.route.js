"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_validate_1 = __importDefault(require("../../validates/admin/auth.validate"));
const auth_controller_1 = __importDefault(require("../../controllers/admin/auth.controller"));
router.get("/login", auth_controller_1.default.login);
router.post("/login", auth_validate_1.default.loginPost, auth_controller_1.default.loginPost);
router.post("/logout", auth_controller_1.default.logoutPost);
exports.default = router;
