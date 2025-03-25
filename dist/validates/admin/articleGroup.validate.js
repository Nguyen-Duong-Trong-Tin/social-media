"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const articleGroup_enum_1 = require("../../enums/articleGroup.enum");
// [POST] /admin/articleGroups/create
const createPost = (req, res, next) => {
    try {
        const title = req.body.title;
        const description = req.body.description;
        const images = req.files["images"];
        const videos = req.files["videos"];
        const status = req.body.status;
        const userId = req.body.userId;
        const groupId = req.body.groupId;
        if (!title ||
            !description ||
            !status ||
            !userId ||
            !groupId) {
            req.flash("error", "Thông tin không đầy đủ!");
            return res.redirect("back");
        }
        if (typeof title !== "string" ||
            typeof description !== "string" ||
            typeof status !== "string" ||
            typeof userId !== "string" ||
            typeof groupId !== "string") {
            req.flash("error", "Kiểu dữ liệu không chính xác!");
            return res.redirect("back");
        }
        if (images &&
            images.length > 6) {
            req.flash("error", "Chỉ chọn tối đa 6 ảnh!");
            return res.redirect("back");
        }
        if (videos &&
            videos.length > 6) {
            req.flash("error", "Chỉ chọn tối đa 6 đoạn phim!");
            return res.redirect("back");
        }
        if (!Object.values(articleGroup_enum_1.EArticleGroupStatus).includes(status)) {
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
// [PATCH] /admin/articleGroups/update/:id
const updatePatch = (req, res, next) => {
    try {
        const title = req.body.title;
        const description = req.body.description;
        const images = req.files["images"];
        const videos = req.files["videos"];
        const status = req.body.status;
        const userId = req.body.userId;
        const groupId = req.body.groupId;
        if (!title ||
            !description ||
            !status ||
            !userId ||
            !groupId) {
            req.flash("error", "Thông tin không đầy đủ!");
            return res.redirect("back");
        }
        if (typeof title !== "string" ||
            typeof description !== "string" ||
            typeof status !== "string" ||
            typeof userId !== "string" ||
            typeof groupId !== "string") {
            req.flash("error", "Kiểu dữ liệu không chính xác!");
            return res.redirect("back");
        }
        if (images &&
            images.length > 6) {
            req.flash("error", "Chỉ chọn tối đa 6 ảnh!");
            return res.redirect("back");
        }
        if (videos &&
            videos.length > 6) {
            req.flash("error", "Chỉ chọn tối đa 6 đoạn phim!");
            return res.redirect("back");
        }
        if (!Object.values(articleGroup_enum_1.EArticleGroupStatus).includes(status)) {
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
// [PATCH] /admin/articleGroups/actions
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
// [PATCH] /admin/articleGroups/updateStatus/:status/:id
const updateStatus = (req, res, next) => {
    try {
        const status = req.params.status;
        if (!Object.values(articleGroup_enum_1.EArticleGroupStatus).includes(status)) {
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
const articleGroupValidate = {
    createPost,
    updatePatch,
    updateStatus,
    actions
};
exports.default = articleGroupValidate;
