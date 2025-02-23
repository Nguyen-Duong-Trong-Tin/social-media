"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// [PATCH] /admin/permissions/update
const updatePatch = (req, res, next) => {
    try {
        return next();
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
};
const permissionValidate = {
    updatePatch
};
exports.default = permissionValidate;
