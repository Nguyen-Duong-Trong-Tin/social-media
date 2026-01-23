"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const group_enum_1 = require("../../enums/group.enum");
// [POST] /admin/groups/create
const createPost = (req, res, next) => {
    try {
        const title = req.body.title;
        const description = req.body.description;
        const avatar = req.files["avatar"];
        const coverPhoto = req.files["coverPhoto"];
        const status = req.body.status;
        const userId = req.body.userId;
        const groupTopicId = req.body.groupTopicId;
        if (!title ||
            !description ||
            !avatar ||
            !coverPhoto ||
            !status ||
            !userId ||
            !groupTopicId) {
            req.flash("error", "Input required!");
            return res.redirect("back");
        }
        if (typeof title !== "string" ||
            typeof description !== "string" ||
            typeof status !== "string" ||
            typeof userId !== "string" ||
            typeof groupTopicId !== "string") {
            req.flash("error", "Datatype wrong!");
            return res.redirect("back");
        }
        if (!Object.values(group_enum_1.EGroupStatus).includes(status)) {
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
// [PATCH] /admin/groups/update/:id
const updatePatch = (req, res, next) => {
    try {
        const title = req.body.title;
        const description = req.body.description;
        const status = req.body.status;
        const groupTopicId = req.body.groupTopicId;
        if (!title ||
            !description ||
            !status ||
            !groupTopicId) {
            req.flash("error", "Something went wrong!");
            return res.redirect("back");
        }
        if (typeof title !== "string" ||
            typeof description !== "string" ||
            typeof status !== "string" ||
            typeof groupTopicId !== "string") {
            req.flash("error", "Datatype wrong!");
            return res.redirect("back");
        }
        if (status &&
            !Object.values(group_enum_1.EGroupStatus).includes(status)) {
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
// [PATCH] /admin/groups/changeUserRole/:role/:userId/:id
const changeUserRole = (req, res, next) => {
    try {
        const role = req.params.role;
        if (!Object.values(group_enum_1.EGroupRole).includes(role)) {
            req.flash("error", "User role wrong!");
            return res.redirect("back");
        }
        return next();
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
        return res.redirect("back");
    }
};
// [PATCH] /admin/groups/actions
const actions = (req, res, next) => {
    try {
        const action = req.body.action;
        const ids = req.body.ids;
        if (!action ||
            !ids) {
            req.flash("error", "Input required!");
            return res.redirect("back");
        }
        if (typeof action !== "string" ||
            typeof ids !== "string") {
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
// [PATCH] /admin/groups/updateStatus/:status/:id
const updateStatus = (req, res, next) => {
    try {
        const status = req.params.status;
        if (!Object.values(group_enum_1.EGroupStatus).includes(status)) {
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
const groupValidate = {
    createPost,
    updatePatch,
    changeUserRole,
    actions,
    updateStatus
};
exports.default = groupValidate;
