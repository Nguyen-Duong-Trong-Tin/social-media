"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const storage_util_1 = __importDefault(require("../../utils/storage.util"));
const multer_util_1 = __importDefault(require("../../utils/multer.util"));
const deserialize_middleware_1 = __importDefault(require("../../middlewares/client/deserialize.middleware"));
const taskGroupSubmission_validate_1 = __importDefault(require("../../validates/client/taskGroupSubmission.validate"));
const taskGroupSubmission_controller_1 = __importDefault(require("../../controllers/client/taskGroupSubmission.controller"));
const router = express_1.default.Router();
const upload = (0, multer_util_1.default)({ storage: storage_util_1.default });
router.get("/", deserialize_middleware_1.default, taskGroupSubmission_controller_1.default.find);
router.get("/slug/:slug", deserialize_middleware_1.default, taskGroupSubmission_controller_1.default.findBySlug);
router.post("/find-by-user-id-and-task-group-ids", deserialize_middleware_1.default, taskGroupSubmission_controller_1.default.findByUserIdAndTaskGroupIds);
router.post("/submit", deserialize_middleware_1.default, upload.fields([
    { name: "images", maxCount: 6 },
    { name: "videos", maxCount: 6 },
    { name: "materials", maxCount: 6 },
]), taskGroupSubmission_validate_1.default.submit, taskGroupSubmission_controller_1.default.submit);
router.patch("/scoring/:id", deserialize_middleware_1.default, taskGroupSubmission_validate_1.default.scoring, taskGroupSubmission_controller_1.default.scoring);
exports.default = router;
