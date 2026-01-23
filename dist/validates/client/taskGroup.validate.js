"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const taskGroup_enum_1 = require("../../enums/taskGroup.enum");
// POST /v1/taskGroups
const create = (req, res, next) => {
    try {
        const title = req.body.title;
        const images = req.files["images"];
        const videos = req.files["videos"];
        const status = req.body.status;
        const userId = req.body.userId;
        const groupId = req.body.groupId;
        const deadline = req.body.deadline;
        if (!title || !status || !userId || !groupId || !deadline) {
            return res.status(400).json({
                status: false,
                message: "Input required!",
            });
        }
        if (typeof title !== "string" ||
            typeof status !== "string" ||
            typeof userId !== "string" ||
            typeof groupId !== "string" ||
            typeof deadline !== "string" ||
            isNaN(new Date(deadline).getTime())) {
            return res.status(400).json({
                status: false,
                message: "Datatype wrong",
            });
        }
        if (images && images.length > 6) {
            return res.status(400).json({
                status: false,
                messag: "Max 6 images",
            });
        }
        if (videos && videos.length > 6) {
            return res.status(400).json({
                status: false,
                message: "Max 6 videos",
            });
        }
        if (!Object.values(taskGroup_enum_1.ETaskGroupStatus).includes(status)) {
            return res.status(400).json({
                status: false,
                message: "Status wrong",
            });
        }
        if (new Date(deadline).getTime() < Date.now()) {
            return res.status(400).json({
                status: false,
                message: "Deadline wrong",
            });
        }
        return next();
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
        return res.redirect("back");
    }
};
// PATCH /v1/taskGroups
const update = (req, res, next) => {
    try {
        const title = req.body.title;
        const description = req.body.description;
        const images = req.files["images"];
        const videos = req.files["videos"];
        const status = req.body.status;
        const userId = req.body.userId;
        const groupId = req.body.groupId;
        const deadline = req.body.deadline;
        if (!title && !description && !status && !userId && !groupId && !deadline) {
            return res.status(400).json({
                status: false,
                message: "Input required!",
            });
        }
        if ((title && typeof title !== "string") ||
            (description && typeof description !== "string") ||
            (status && typeof status !== "string") ||
            (userId && typeof userId !== "string") ||
            (groupId && typeof groupId !== "string") ||
            (deadline &&
                (typeof deadline !== "string" || isNaN(new Date(deadline).getTime())))) {
            return res.status(400).json({
                status: false,
                message: "Datatype wrong",
            });
        }
        if (images && images.length > 6) {
            return res.status(400).json({
                status: false,
                messag: "Max 6 images",
            });
        }
        if (videos && videos.length > 6) {
            return res.status(400).json({
                status: false,
                message: "Max 6 videos",
            });
        }
        if (status &&
            !Object.values(taskGroup_enum_1.ETaskGroupStatus).includes(status)) {
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
};
const taskGroupValidate = {
    create,
    update
};
exports.default = taskGroupValidate;
