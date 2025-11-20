"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const taskGroupSubmission_enum_1 = require("../../enums/taskGroupSubmission.enum");
// POST /v1/taskGroupSubmissions/submit
const submit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const title = req.body.title;
        const images = req.files["images"];
        const videos = req.files["videos"];
        const materials = req.files["materials"];
        const status = req.body.status;
        const userId = req.body.userId;
        const taskGroupId = req.body.taskGroupId;
        if (!title || !status || !userId || !taskGroupId) {
            return res.status(400).json({
                status: false,
                message: "Input required",
            });
        }
        if (typeof title !== "string" ||
            typeof status !== "string" ||
            typeof userId !== "string" ||
            typeof taskGroupId !== "string") {
            return res.status(400).json({
                status: false,
                message: "Datatype wrong",
            });
        }
        if (images && images.length > 6) {
            return res.status(400).json({
                status: false,
                message: "Max 6 images",
            });
        }
        if (videos && videos.length > 6) {
            return res.status(400).json({
                status: false,
                message: "Max 6 videos",
            });
        }
        if (materials && materials.length > 6) {
            return res.status(400).json({
                status: false,
                message: "Max 6 materials",
            });
        }
        if (!Object.values(taskGroupSubmission_enum_1.ETaskGroupSubmissionStatus).includes(status)) {
            return res.status(400).json({
                status: false,
                message: "Status wrong",
            });
        }
        return next();
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
const taskGroupSubmissionValidate = {
    submit,
};
exports.default = taskGroupSubmissionValidate;
