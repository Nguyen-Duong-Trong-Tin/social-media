"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const roomChat_enum_1 = require("../../enums/roomChat.enum");
// [POST] /admin/roomChats/create
const createPost = (req, res, next) => {
    try {
        const title = req.body.title;
        const avatar = req.file;
        const status = req.body.status;
        const userId = req.body.userId;
        if (!title ||
            !avatar ||
            !status ||
            !userId) {
            req.flash("error", "Input required!");
            return res.redirect("back");
        }
        if (typeof title !== "string" ||
            typeof status !== "string" ||
            typeof userId !== "string") {
            req.flash("error", "Datatype wrong!");
            return res.redirect("back");
        }
        if (!Object.values(roomChat_enum_1.ERoomChatStatus).includes(status)) {
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
// [PATCH] /admin/roomChats/update/:id
const updatePatch = (req, res, next) => {
    try {
        const title = req.body.title;
        const status = req.body.status;
        if (!title ||
            !status) {
            req.flash("error", "Something went wrong!");
            return res.redirect("back");
        }
        if (typeof title !== "string" ||
            typeof status !== "string") {
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
// [PATCH] /admin/roomChats/changeUserRole/:role/:userId/:id
const changeUserRole = (req, res, next) => {
    try {
        const role = req.params.role;
        if (!Object.values(roomChat_enum_1.ERoomChatRole).includes(role)) {
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
// [PATCH] /admin/roomChats/actions
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
// [PATCH] /admin/roomChats/updateStatus/:status/:id
const updateStatus = (req, res, next) => {
    try {
        const status = req.params.status;
        if (!Object.values(roomChat_enum_1.ERoomChatStatus).includes(status)) {
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
const roomChatValidate = {
    createPost,
    updatePatch,
    changeUserRole,
    actions,
    updateStatus
};
exports.default = roomChatValidate;
