"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// [POST] /admin/groupTopics/create
const createPost = (req, res, next) => {
    try {
        const title = req.body.title;
        const description = req.body.description;
        if (!title ||
            !description) {
            req.flash("error", "Thông tin không đầy đủ!");
            return res.redirect("back");
        }
        if (typeof title !== "string" ||
            typeof description !== "string") {
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
// [PATCH] /admin/groupTopics/update/:id
const updatePatch = (req, res, next) => {
    try {
        const title = req.body.title;
        const description = req.body.description;
        if (!title ||
            !description) {
            req.flash("error", "Thông tin không đầy đủ!");
            return res.redirect("back");
        }
        if (typeof title !== "string" ||
            typeof description !== "string") {
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
// [PATCH] /admin/groupTopics/actions
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
const groupTopicValidate = {
    createPost,
    actions,
    updatePatch
};
exports.default = groupTopicValidate;
