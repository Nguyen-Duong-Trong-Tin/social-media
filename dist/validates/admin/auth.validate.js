"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// [POST] /admin/auth/login
const loginPost = (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        if (!email ||
            !password) {
            req.flash("error", "Input required!");
            return res.redirect("back");
        }
        if (typeof email !== "string" ||
            typeof password !== "string") {
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
const authValidate = {
    loginPost
};
exports.default = authValidate;
