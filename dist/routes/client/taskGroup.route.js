"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const storage_util_1 = __importDefault(require("../../utils/storage.util"));
const multer_util_1 = __importDefault(require("../../utils/multer.util"));
const deserialize_middleware_1 = __importDefault(require("../../middlewares/client/deserialize.middleware"));
const taskGroup_validate_1 = __importDefault(require("../../validates/client/taskGroup.validate"));
const taskGroup_controller_1 = __importDefault(require("../../controllers/client/taskGroup.controller"));
const upload = (0, multer_util_1.default)({ storage: storage_util_1.default });
const router = express_1.default.Router();
router.post("/", deserialize_middleware_1.default, upload.fields([
    { name: "images", maxCount: 6 },
    { name: "videos", maxCount: 6 },
]), taskGroup_validate_1.default.create, taskGroup_controller_1.default.create);
router.patch("/:id", deserialize_middleware_1.default, upload.fields([
    { name: "images", maxCount: 6 },
    { name: "videos", maxCount: 6 },
]), taskGroup_validate_1.default.update, taskGroup_controller_1.default.update);
router.delete("/:id", deserialize_middleware_1.default, taskGroup_controller_1.default.del);
router.get("/", deserialize_middleware_1.default, taskGroup_controller_1.default.find);
router.get("/:id", deserialize_middleware_1.default, taskGroup_controller_1.default.findById);
exports.default = router;
