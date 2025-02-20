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
const getUrl_helper_1 = __importDefault(require("../../helpers/getUrl.helper"));
const role_service_1 = __importDefault(require("../../services/admin/role.service"));
const account_service_1 = __importDefault(require("../../services/admin/account.service"));
// [GET] /admin/roles?page=:page&limit=:limit&keyword=:keyword&sort=title-asc
const get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sort = req.query.sort;
        const sortOptions = [
            { value: "", title: "---" },
            { value: "title-asc", title: "Tiêu đề tăng dần" },
            { value: "title-desc", title: "Tiêu đề giảm dần" }
        ];
        const keyword = req.query.keyword;
        const actionOptions = [
            { value: "", title: "---" },
            { value: "delete", title: "Xóa" }
        ];
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const [maxPage, roles] = yield Promise.all([
            role_service_1.default.calculateMaxPage(limit),
            role_service_1.default.find(req)
        ]);
        return res.render("admin/pages/roles", {
            pageTitle: "Danh Sách Vai Trò",
            url: (0, getUrl_helper_1.default)(req),
            roles,
            sort: {
                sort,
                sortOptions
            },
            keyword,
            actionOptions,
            pagination: {
                page,
                limit,
                maxPage
            }
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra");
        return res.redirect("back");
    }
});
// [GET] /admin/roles/detail/:id
const getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const roleExists = yield role_service_1.default.findById(id);
        if (!roleExists) {
            req.flash("error", "Vai trò không tồn tại!");
            return res.redirect("back");
        }
        const [createdBy, updatedBy] = yield Promise.all([
            account_service_1.default.findById(roleExists.createdBy.accountId).then(account => ({
                account,
                createdAt: roleExists.createdBy.createdAt
            })),
            Promise.all(roleExists.updatedBy.map(item => account_service_1.default.findById(item.accountId).then(account => ({
                account,
                updatedAt: item.updatedAt
            }))))
        ]);
        return res.render("admin/pages/roles/detail", {
            pageTitle: "Chi Tiết Vai Trò",
            role: roleExists,
            createdBy,
            updatedBy
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [GET] /admin/roles/create
const create = (req, res) => {
    try {
        return res.render("admin/pages/roles/create", {
            pageTitle: "Thêm Mới Vai Trò"
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
};
// [POST] /admin/roles/create
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = req.account;
        const title = req.body.title;
        const description = req.body.description;
        yield role_service_1.default.create({
            title,
            description,
            permission: [],
            createdBy: {
                accountId: myAccount.accountId,
                createdAt: new Date()
            },
            deleted: false
        });
        req.flash("success", "Vai trò được tạo thành công!");
        return res.redirect(`/${index_config_1.default.admin}/roles`);
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [GET] /admin/roles/update/:id
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const roleExists = yield role_service_1.default.findById(id);
        if (!roleExists) {
            req.flash("error", "Vai trò không tồn tại!");
            return res.redirect("back");
        }
        return res.render("admin/pages/roles/update", {
            pageTitle: "Cập Nhật Vai Trò",
            role: roleExists
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [PATCH] /admin/roles/update/:id
const updatePatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = req.account;
        const id = req.params.id;
        const title = req.body.title;
        const description = req.body.description;
        const roleExists = yield role_service_1.default.findById(id);
        if (!roleExists) {
            req.flash("error", "Vai trò không tồn tại!");
            return req.redirect("back");
        }
        yield role_service_1.default.update(id, {
            title,
            description,
            $push: {
                updatedBy: {
                    accountId: myAccount.accountId,
                    updatedAt: new Date()
                }
            }
        });
        req.flash("success", "Vai trò được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [PATCH] /admin/roles/actions
const actions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = req.account;
        const action = req.body.action;
        const ids = req.body.ids.split(',');
        switch (action) {
            case "delete": {
                yield Promise.all(ids.map(id => role_service_1.default.del(id, {
                    accountId: myAccount.accountId,
                    deletedAt: new Date()
                })));
                break;
            }
            default: {
                req.flash("error", "Hành động không chính xác!");
                return res.redirect("back");
            }
        }
        req.flash("success", "Các vai trò được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [DELETE] /admin/roles/delete/:id
const del = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = req.account;
        const id = req.params.id;
        const roleExists = yield role_service_1.default.findById(id);
        if (!roleExists) {
            req.flash("error", "Vai trò không tồn tại!");
            return res.redirect("back");
        }
        yield role_service_1.default.del(id, {
            accountId: myAccount.accountId,
            deletedAt: new Date()
        });
        req.flash("success", "Vai trò được xóa thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
const roleController = {
    get,
    getById,
    create,
    createPost,
    update,
    updatePatch,
    actions,
    del
};
exports.default = roleController;
