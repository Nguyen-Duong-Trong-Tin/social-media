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
const account_enum_1 = require("../../enums/account.enum");
const getUrl_helper_1 = __importDefault(require("../../helpers/getUrl.helper"));
const role_service_1 = __importDefault(require("../../services/admin/role.service"));
const account_service_1 = __importDefault(require("../../services/admin/account.service"));
const md5_util_1 = __importDefault(require("../../utils/md5.util"));
const slug_util_1 = __importDefault(require("../../utils/slug.util"));
const shortUniqueKey_util_1 = __importDefault(require("../../utils/shortUniqueKey.util"));
// [GET] /admin/accounts?page=:page&limit=:limit&keyword=:keyword&sort=title-asc
const get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("accountView")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/dashboard`);
        }
        const filter = req.query.filter;
        const filterOptions = [
            { value: "", title: "---" },
            { value: "status-active", title: "Trạng thái hoạt động" },
            { value: "status-inactive", title: "Trạng thái ngưng hoạt động" },
        ];
        const sort = req.query.sort;
        const sortOptions = [
            { value: "", title: "---" },
            { value: "fullName-asc", title: "Họ tên tăng dần" },
            { value: "fullName-desc", title: "Họ tên giảm dần" },
            { value: "email-asc", title: "Email tăng dần" },
            { value: "email-desc", title: "Email giảm dần" },
            { value: "roleId-asc", title: "Gom nhóm theo vai trò" }
        ];
        const keyword = req.query.keyword;
        const actionOptions = [
            { value: "", title: "---" },
            { value: "delete", title: "Xóa" },
            { value: "active", title: "Hoạt động" },
            { value: "inactive", title: "Ngưng hoạt động" }
        ];
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const [maxPage, accounts] = yield Promise.all([
            account_service_1.default.calculateMaxPage(limit),
            account_service_1.default.find(req)
        ]);
        const roles = yield Promise.all(accounts.map(account => role_service_1.default.findById(account.roleId)));
        return res.render("admin/pages/accounts", {
            pageTitle: "Danh Sách Tài Khoản",
            url: (0, getUrl_helper_1.default)(req),
            accounts,
            roles,
            filter: {
                filter,
                filterOptions
            },
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
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [GET] /admin/accounts/detail/:id
const getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("accountView")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/dashboard`);
        }
        const id = req.params.id;
        const [accountExists, roles] = yield Promise.all([
            account_service_1.default.findById(id),
            role_service_1.default.findAll()
        ]);
        if (!accountExists) {
            req.flash("error", "Tài khoản không tồn tại!");
            return res.redirect("back");
        }
        const [createdBy, updatedBy] = yield Promise.all([
            account_service_1.default.findById(accountExists.createdBy.accountId).then(account => ({
                account,
                createdAt: accountExists.createdBy.createdAt
            })),
            Promise.all(accountExists.updatedBy.map(item => account_service_1.default.findById(item.accountId).then(account => ({
                account,
                updatedAt: item.updatedAt
            }))))
        ]);
        return res.render("admin/pages/accounts/detail", {
            pageTitle: "Chi Tiết Tài Khoản",
            account: accountExists,
            roles,
            createdBy,
            updatedBy
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [GET] /admin/accounts/create
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("accountCreate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/accounts`);
        }
        const roles = yield role_service_1.default.findAll();
        return res.render("admin/pages/accounts/create", {
            pageTitle: "Tạo Mới Tài Khoản",
            roles
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [POST] /admin/accounts/create
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("accountCreate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/accounts`);
        }
        const fullName = req.body.fullName;
        const slug = slug_util_1.default.convert(fullName) + '-' + shortUniqueKey_util_1.default.generate();
        const email = req.body.email;
        const password = md5_util_1.default.encode(req.body.password);
        const phone = req.body.phone;
        const avatar = req.file.path;
        const status = req.body.status;
        const roleId = req.body.roleId;
        const [accountSlugExists, accountEmailExists, accountPhoneExists, roleExists] = yield Promise.all([
            account_service_1.default.findBySlug(slug),
            account_service_1.default.findByEmail(email),
            account_service_1.default.findByPhone(phone),
            role_service_1.default.findById(roleId)
        ]);
        if (accountSlugExists) {
            req.flash("error", "Có lỗi xảy ra!");
            return res.redirect("back");
        }
        if (accountEmailExists) {
            req.flash("error", "Email đã tồn tại!");
            return res.redirect("back");
        }
        if (accountPhoneExists) {
            req.flash("error", "Số điện thoại đã tồn tại!");
            return res.redirect("back");
        }
        if (!roleExists) {
            req.flash("error", "Vai trò không được tìm thấy!");
            return res.redirect("back");
        }
        yield account_service_1.default.create({
            fullName,
            slug,
            email,
            password,
            phone,
            avatar,
            status: status,
            roleId,
            createdBy: {
                accountId: myAccount.accountId,
                createdAt: new Date()
            },
            deleted: false
        });
        req.flash("success", "Tài khoản được tạo thành công!");
        return res.redirect(`/${index_config_1.default.admin}/accounts`);
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [GET] /admin/accounts/update/:id
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("accountUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/accounts`);
        }
        const id = req.params.id;
        const [accountExists, roles] = yield Promise.all([
            account_service_1.default.findById(id),
            role_service_1.default.findAll()
        ]);
        if (!accountExists) {
            req.flash("error", "Có lỗi xảy ra!");
            return res.redirect("back");
        }
        return res.render("admin/pages/accounts/update", {
            pageTitle: "Cập Nhật Tài Khoản",
            account: accountExists,
            roles
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [PATCH] /admin/accounts/update/:id
const updatePatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("accountUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/accounts`);
        }
        const id = req.params.id;
        const fullName = req.body.fullName;
        const slug = slug_util_1.default.convert(fullName) + '-' + shortUniqueKey_util_1.default.generate();
        const email = req.body.email;
        const phone = req.body.phone;
        const status = req.body.status;
        const roleId = req.body.roleId;
        let avatar = undefined;
        if (req.file && req.file.path) {
            avatar = req.file.path;
        }
        const [accountIdExists, accountSlugExists, accountEmailExists, accountPhoneExists, roleExists] = yield Promise.all([
            account_service_1.default.findById(id),
            account_service_1.default.findBySlug(slug),
            account_service_1.default.findByEmail(email),
            account_service_1.default.findByPhone(phone),
            role_service_1.default.findById(roleId)
        ]);
        if (!accountIdExists) {
            req.flash("error", "Tài khoản không tồn tại!");
            return res.redirect("back");
        }
        if (accountSlugExists) {
            req.flash("error", "Có lỗi xảy ra!");
            return res.redirect("back");
        }
        if (accountEmailExists &&
            accountEmailExists.id !== id) {
            req.flash("error", "Email đã tồn tại!");
            return res.redirect("back");
        }
        if (accountPhoneExists &&
            accountPhoneExists.id !== id) {
            req.flash("error", "Số điện thoại đã tồn tại!");
            return res.redirect("back");
        }
        if (!roleExists) {
            req.flash("error", "Vai trò không tồn tại!");
            return res.redirect("back");
        }
        yield account_service_1.default.update(id, {
            fullName,
            slug,
            email,
            phone,
            avatar,
            status: status,
            roleId,
            $push: {
                updatedBy: {
                    accountId: myAccount.accountId,
                    updatedAt: new Date()
                }
            }
        });
        req.flash("success", "Tài khoản được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [PATCH] /admin/accounts/actions
const actions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        const action = req.body.action;
        const ids = req.body.ids.split(',');
        switch (action) {
            case "delete": {
                if (!myAccount.permissions.includes("accountDelete")) {
                    req.flash("error", "Bạn không có quyền!");
                    return res.redirect(`/${index_config_1.default.admin}/accounts`);
                }
                yield Promise.all(ids.map(id => account_service_1.default.del(id, {
                    accountId: myAccount.accountId,
                    deletedAt: new Date()
                })));
                break;
            }
            case "active": {
                if (!myAccount.permissions.includes("accountUpdate")) {
                    req.flash("error", "Bạn không có quyền!");
                    return res.redirect(`/${index_config_1.default.admin}/accounts`);
                }
                yield Promise.all(ids.map(id => account_service_1.default.update(id, {
                    status: account_enum_1.EAccountStatus.active,
                    $push: {
                        updatedBy: {
                            accountId: myAccount.accountId,
                            updatedAt: new Date()
                        }
                    }
                })));
                break;
            }
            case "inactive": {
                if (!myAccount.permissions.includes("accountUpdate")) {
                    req.flash("error", "Bạn không có quyền!");
                    return res.redirect(`/${index_config_1.default.admin}/accounts`);
                }
                yield Promise.all(ids.map(id => account_service_1.default.update(id, {
                    status: account_enum_1.EAccountStatus.inactive,
                    $push: {
                        updatedBy: {
                            accountId: myAccount.accountId,
                            updatedAt: new Date()
                        }
                    }
                })));
                break;
            }
            default: {
                req.flash("error", "Hành động không chính xác!");
                return res.redirect("back");
            }
        }
        req.flash("success", "Các tài khoản được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [PATCH] /admin/accounts/updateStatus/:status/:id
const updateStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("accountUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/accounts`);
        }
        const id = req.params.id;
        const status = req.params.status;
        const accountExists = yield account_service_1.default.findById(id);
        if (!accountExists) {
            req.flash("error", "Tài khoản không tồn tại!");
            return res.redirect("back");
        }
        yield account_service_1.default.update(id, {
            status: status,
            $push: {
                updatedBy: {
                    accountId: myAccount.accountId,
                    updatedAt: new Date()
                }
            }
        });
        req.flash("success", "Tài khoản được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [DELETE] /admin/accounts/delete/:id
const del = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("accountDelete")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/accounts`);
        }
        const id = req.params.id;
        const accountExists = yield account_service_1.default.findById(id);
        if (!accountExists) {
            req.flash("error", "Tài khoản không tồn tại!");
            return res.redirect("back");
        }
        yield account_service_1.default.del(id, {
            accountId: myAccount.accountId,
            deletedAt: new Date()
        });
        req.flash("success", "Tài khoản được xóa thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
const accountController = {
    get,
    getById,
    create,
    createPost,
    update,
    updatePatch,
    actions,
    updateStatus,
    del
};
exports.default = accountController;
