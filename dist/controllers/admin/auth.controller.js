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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_config_1 = __importDefault(require("../../configs/index.config"));
const auth_service_1 = __importDefault(require("../../services/admin/auth.service"));
const md5_util_1 = __importDefault(require("../../utils/md5.util"));
const jwt_util_1 = __importDefault(require("../../utils/jwt.util"));
// [GET] /admin/auth/login
const login = (req, res) => {
    try {
        console.log("OK");
        return res.render("admin/pages/auth/login", { pageTitle: "Đăng Nhập" });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
};
// [POST] /admin/auth/login
const loginPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const password = md5_util_1.default.encode(req.body.password);
        const accountExists = yield auth_service_1.default.login(email, password);
        if (!accountExists) {
            req.flash("error", "Đăng nhập không thành công!");
            return res.redirect("back");
        }
        const token = jwt_util_1.default.accountGenerate(accountExists.id, accountExists.roleId, "1d");
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            maxAge: 1000 * 60 * 60 * 24
        });
        return res.redirect(`/${index_config_1.default.admin}/dashboard`);
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [POST] /admin/auth/logout
const logoutPost = (req, res) => {
    try {
        res.clearCookie("token");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
};
const authController = {
    login,
    loginPost,
    logoutPost
};
exports.default = authController;
