"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// [GET] /admin/dashboard
const get = (req, res) => {
    try {
        return res.render("admin/pages/dashboard", { pageTitle: "Dashboard" });
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
        return res.redirect("back");
    }
};
const dashboardController = {
    get
};
exports.default = dashboardController;
