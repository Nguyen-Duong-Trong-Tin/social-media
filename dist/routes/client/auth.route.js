"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_validate_1 = __importDefault(require("../../validates/client/auth.validate"));
const auth_controller_1 = __importDefault(require("../../controllers/client/auth.controller"));
router.post("/register", auth_validate_1.default.register, auth_controller_1.default.register);
router.post("/login", auth_validate_1.default.login, auth_controller_1.default.login);
router.get("/verify-access-token", auth_validate_1.default.verifyAccessToken, auth_controller_1.default.verifyAccessToken);
router.post("/refresh-token", auth_validate_1.default.refreshToken, auth_controller_1.default.refreshToken);
exports.default = router;
