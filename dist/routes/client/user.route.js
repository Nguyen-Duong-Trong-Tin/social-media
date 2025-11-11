"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const deserialize_middleware_1 = __importDefault(require("../../middlewares/client/deserialize.middleware"));
const user_validate_1 = __importDefault(require("../../validates/client/user.validate"));
const user_controller_1 = __importDefault(require("../../controllers/client/user.controller"));
router.post("/check-exists/email", user_validate_1.default.checkExistsEmail, user_controller_1.default.checkExistsEmail);
router.post("/check-exists/phone", user_validate_1.default.checkExistsPhone, user_controller_1.default.checkExistsPhone);
router.post("/ids", deserialize_middleware_1.default, user_controller_1.default.findUsersByIds);
router.get("/", deserialize_middleware_1.default, user_controller_1.default.findUsers);
router.get("/slug/:slug", deserialize_middleware_1.default, user_controller_1.default.findUserBySlug);
router.patch("/bio/:id", deserialize_middleware_1.default, user_validate_1.default.updateBio, user_controller_1.default.updateBio);
exports.default = router;
