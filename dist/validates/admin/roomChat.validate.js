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
            req.flash("error", "Thông tin không đầy đủ!");
            return res.redirect("back");
        }
        if (typeof title !== "string" ||
            typeof status !== "string" ||
            typeof userId !== "string") {
            req.flash("error", "Kiểu dữ liệu không chính xác!");
            return res.redirect("back");
        }
        if (!Object.values(roomChat_enum_1.ERoomChatStatus).includes(status)) {
            req.flash("error", "Trạng thái không chính xác!");
            return res.redirect("back");
        }
        return next();
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
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
            req.flash("error", "Có lỗi xảy ra!");
            return res.redirect("back");
        }
        if (typeof title !== "string" ||
            typeof status !== "string") {
            req.flash("error", "Kiểu dữ liệu không chính xác!");
            return res.redirect("back");
        }
        return next();
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
};
// [PATCH] /admin/roomChats/changeUserRole/:role/:userId/:id
const changeUserRole = (req, res, next) => {
    try {
        const role = req.params.role;
        if (!Object.values(roomChat_enum_1.ERoomChatRole).includes(role)) {
            req.flash("error", "Vai trò người dùng không chính xác!");
            return res.redirect("back");
        }
        return next();
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
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
            req.flash("error", "Thiếu thông tin cần thiết!");
            return res.redirect("back");
        }
        if (typeof action !== "string" ||
            typeof ids !== "string") {
            req.flash("error", "Kiểu dữ liệu không chính xác!");
            return res.redirect("back");
        }
        return next();
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
};
// [PATCH] /admin/roomChats/updateStatus/:status/:id
const updateStatus = (req, res, next) => {
    try {
        const status = req.params.status;
        if (!Object.values(roomChat_enum_1.ERoomChatStatus).includes(status)) {
            req.flash("error", "Trạng thái không chính xác!");
            return res.redirect("back");
        }
        return next();
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
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
