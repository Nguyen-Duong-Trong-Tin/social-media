"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_config_1 = __importDefault(require("../../configs/index.config"));
const variable = (req, res, next) => {
    try {
        res.locals.admin = index_config_1.default.admin;
        return next();
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
        return res.redirect("back");
    }
};
const redirect = (req, res) => {
    try {
        return res.redirect(`/${index_config_1.default.admin}/auth/login`);
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
        return res.redirect("back");
    }
};
const adminMiddleware = {
    variable,
    redirect
};
exports.default = adminMiddleware;
