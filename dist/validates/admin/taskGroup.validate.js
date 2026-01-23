"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const taskGroup_enum_1 = require("../../enums/taskGroup.enum");
// [POST] /admin/taskGroups/create
const createPost = (req, res, next) => {
    try {
        const title = req.body.title;
        const description = req.body.description;
        const images = req.files["images"];
        const videos = req.files["videos"];
        const status = req.body.status;
        const userId = req.body.userId;
        const groupId = req.body.groupId;
        if (!title || !description || !status || !userId || !groupId) {
            req.flash("error", "Input required!");
            return res.redirect("back");
        }
        if (typeof title !== "string" ||
            typeof description !== "string" ||
            typeof status !== "string" ||
            typeof userId !== "string" ||
            typeof groupId !== "string") {
            req.flash("error", "Datatype wrong!");
            return res.redirect("back");
        }
        if (images && images.length > 6) {
            req.flash("error", "Maximum 6 images allowed!");
            return res.redirect("back");
        }
        if (videos && videos.length > 6) {
            req.flash("error", "Maximum 6 videos allowed!");
            return res.redirect("back");
        }
        if (!Object.values(taskGroup_enum_1.ETaskGroupStatus).includes(status)) {
            req.flash("error", "Status wrong!");
            return res.redirect("back");
        }
        return next();
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
        return res.redirect("back");
    }
};
// [PATCH] /admin/taskGroups/update/:id
const updatePatch = (req, res, next) => {
    try {
        const title = req.body.title;
        const description = req.body.description;
        const images = req.files["images"];
        const videos = req.files["videos"];
        const status = req.body.status;
        const userId = req.body.userId;
        const groupId = req.body.groupId;
        if (!title || !description || !status || !userId || !groupId) {
            req.flash("error", "Input required!");
            return res.redirect("back");
        }
        if (typeof title !== "string" ||
            typeof description !== "string" ||
            typeof status !== "string" ||
            typeof userId !== "string" ||
            typeof groupId !== "string") {
            req.flash("error", "Datatype wrong!");
            return res.redirect("back");
        }
        if (images && images.length > 6) {
            req.flash("error", "Maximum 6 images allowed!");
            return res.redirect("back");
        }
        if (videos && videos.length > 6) {
            req.flash("error", "Maximum 6 videos allowed!");
            return res.redirect("back");
        }
        if (!Object.values(taskGroup_enum_1.ETaskGroupStatus).includes(status)) {
            req.flash("error", "Status wrong!");
            return res.redirect("back");
        }
        return next();
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
        return res.redirect("back");
    }
};
// [PATCH] /admin/taskGroups/actions
const actions = (req, res, next) => {
    try {
        const action = req.body.action;
        const ids = req.body.ids;
        if (!action || !ids) {
            req.flash("error", "Input required!");
            return res.redirect("back");
        }
        if (typeof action !== "string" || typeof ids !== "string") {
            req.flash("error", "Datatype wrong!");
            return res.redirect("back");
        }
        return next();
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
        return res.redirect("back");
    }
};
// [PATCH] /admin/taskGroups/updateStatus/:status/:id
const updateStatus = (req, res, next) => {
    try {
        const status = req.params.status;
        if (!Object.values(taskGroup_enum_1.ETaskGroupStatus).includes(status)) {
            req.flash("error", "Status wrong!");
            return res.redirect("back");
        }
        return next();
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
        return res.redirect("back");
    }
};
const taskGroupValidate = {
    createPost,
    updatePatch,
    actions,
    updateStatus,
};
exports.default = taskGroupValidate;
