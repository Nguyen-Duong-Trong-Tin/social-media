"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_enum_1 = __importDefault(require("../../enums/user.enum"));
const validate_helper_1 = __importDefault(require("../../helpers/validate.helper"));
// [POST] /admin/users/create
const createPost = (req, res, next) => {
    try {
        const fullName = req.body.fullName;
        const email = req.body.email;
        const password = req.body.password;
        const phone = req.body.phone;
        const status = req.body.status;
        const bio = req.body.bio;
        if (!fullName ||
            !email ||
            !password ||
            !phone ||
            !req.files["avatar"] ||
            !req.files["coverPhoto"] ||
            !status ||
            !bio) {
            req.flash("error", "Thông tin không đầy đủ!");
            return res.redirect("back");
        }
        if (typeof fullName !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            typeof phone !== "string" ||
            typeof status !== "string" ||
            typeof bio !== "string") {
            req.flash("error", "Kiểu dữ liệu không chính xác!");
            return res.redirect("back");
        }
        if (!validate_helper_1.default.email(email)) {
            req.flash("error", "Email không chính xác!");
            return res.redirect("back");
        }
        if (!validate_helper_1.default.password(password)) {
            req.flash("error", "Mật khẩu phải có độ dài từ 8 kí tự, có kí tự in hoa, in thường, số và kí tự đặc biệt.");
            return res.redirect("back");
        }
        if (!Object.values(user_enum_1.default).includes(status)) {
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
// [PATCH] /admin/users/update/:id
const updatePatch = (req, res, next) => {
    try {
        const fullName = req.body.fullName;
        const email = req.body.email;
        const phone = req.body.phone;
        const status = req.body.status;
        const bio = req.body.bio;
        if (!fullName ||
            !email ||
            !phone ||
            !status ||
            !bio) {
            req.flash("error", "Có lỗi xảy ra!");
            return res.redirect("back");
        }
        if (typeof fullName !== "string" ||
            typeof email !== "string" ||
            typeof phone !== "string" ||
            typeof status !== "string" ||
            typeof bio !== "string") {
            req.flash("error", "Kiểu dữ liệu không chính xác!");
            return res.redirect("back");
        }
        if (!validate_helper_1.default.email(email)) {
            req.flash("error", "Email không chính xác!");
            return res.redirect("back");
        }
        if (!Object.values(user_enum_1.default).includes(status)) {
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
// [PATCH] /admin/users/updateStatus/:status/:id
const updateStatus = (req, res, next) => {
    try {
        const status = req.params.status;
        if (!Object.values(user_enum_1.default).includes(status)) {
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
// [PATCH] /admin/users/actions
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
const userValidate = {
    createPost,
    updatePatch,
    updateStatus,
    actions
};
exports.default = userValidate;
