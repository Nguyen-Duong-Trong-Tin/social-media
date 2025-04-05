"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const storage_util_1 = __importDefault(require("../../utils/storage.util"));
const multer_util_1 = __importDefault(require("../../utils/multer.util"));
const upload = (0, multer_util_1.default)({ storage: storage_util_1.default });
const taskGroup_validate_1 = __importDefault(require("../../validates/admin/taskGroup.validate"));
const taskGroup_controller_1 = __importDefault(require("../../controllers/admin/taskGroup.controller"));
router.get("/", taskGroup_controller_1.default.get);
router.get("/detail/:id", taskGroup_controller_1.default.getById);
router.get("/create", taskGroup_controller_1.default.create);
router.post("/create", upload.fields([
    { name: "images", maxCount: 6 },
    { name: "videos", maxCount: 6 },
]), taskGroup_validate_1.default.createPost, taskGroup_controller_1.default.createPost);
router.get("/update/:id", taskGroup_controller_1.default.update);
router.patch("/update/:id", upload.fields([
    { name: "images", maxCount: 6 },
    { name: "videos", maxCount: 6 },
]), taskGroup_validate_1.default.updatePatch, taskGroup_controller_1.default.updatePatch);
router.patch("/actions", taskGroup_validate_1.default.actions, taskGroup_controller_1.default.actions);
router.patch("/updateStatus/:status/:id", taskGroup_validate_1.default.updateStatus, taskGroup_controller_1.default.updateStatus);
router.delete("/delete/:id", taskGroup_controller_1.default.del);
exports.default = router;
