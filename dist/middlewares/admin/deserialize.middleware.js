"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_config_1 = __importDefault(require("../../configs/index.config"));
const jwt_util_1 = __importDefault(require("../../utils/jwt.util"));
const deserialize = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            req.flash("error", "Đăng nhập để tiếp tục!");
            return res.redirect(`/${index_config_1.default.admin}/auth/login`);
        }
        const verify = jwt_util_1.default.accountVerify(token);
        if (!verify.success) {
            req.flash("error", "Đăng nhập để tiếp tục!");
            return res.redirect(`/${index_config_1.default.admin}/auth/login`);
        }
        req.account = verify.account;
        return next();
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
};
exports.default = deserialize;
