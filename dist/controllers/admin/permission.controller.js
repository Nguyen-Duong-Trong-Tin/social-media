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
const role_service_1 = __importDefault(require("../../services/admin/role.service"));
// [GET] /admin/permissions
const get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.account;
        if (!myAccount.permissions.includes("roleUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/dashboard`);
        }
        const roles = yield role_service_1.default.findAll();
        return res.render("admin/pages/permissions", {
            pageTitle: "Phân Quyền",
            roles
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [PATCH] /admin/permissions/update
const updatePatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.account;
        if (!myAccount.permissions.includes("roleUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/dashboard`);
        }
        const roles = yield role_service_1.default.findAll();
        yield Promise.all(roles.map(role => {
            const id = role.id;
            const permissions = req.body[role.id].split(',');
            return role_service_1.default.update(id, {
                permissions,
                $push: {
                    updatedBy: {
                        accountId: myAccount.accountId,
                        updatedAt: new Date()
                    }
                }
            });
        }));
        req.flash("success", "Quyền được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
const permissionController = {
    get,
    updatePatch
};
exports.default = permissionController;
