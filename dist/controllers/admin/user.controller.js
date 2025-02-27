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
const user_enum_1 = require("../../enums/user.enum");
const getUrl_helper_1 = __importDefault(require("../../helpers/getUrl.helper"));
const user_service_1 = __importDefault(require("../../services/admin/user.service"));
const md5_util_1 = __importDefault(require("../../utils/md5.util"));
const slug_util_1 = __importDefault(require("../../utils/slug.util"));
const shortUniqueKey_util_1 = __importDefault(require("../../utils/shortUniqueKey.util"));
// [GET] /admin/users
const get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("userView")) {
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
            { value: "email-desc", title: "Email giảm dần" }
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
        const [maxPage, users] = yield Promise.all([
            user_service_1.default.calculateMaxPage(limit),
            user_service_1.default.find(req)
        ]);
        return res.render("admin/pages/users", {
            pageTitle: "Danh Sách Người Dùng",
            url: (0, getUrl_helper_1.default)(req),
            users,
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
// [GET] /admin/users/detail/:id
const getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("userView")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/dashboard`);
        }
        const id = req.params.id;
        const userExists = yield user_service_1.default.findById(id);
        if (!userExists) {
            req.flash("error", "Người dùng không tồn tại!");
            return res.redirect("back");
        }
        return res.render("admin/pages/users/detail", {
            pageTitle: "Chi Tiết Người Dùng",
            user: userExists
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [GET] /admin/users/create
const create = (req, res) => {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("userCreate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/users`);
        }
        return res.render("admin/pages/users/create", {
            pageTitle: "Tạo Mới Người Dùng",
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
};
// [POST] /admin/users/create
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("userCreate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/users`);
        }
        const fullName = req.body.fullName;
        const slug = slug_util_1.default.convert(fullName) + '-' + shortUniqueKey_util_1.default.generate();
        const email = req.body.email;
        const password = md5_util_1.default.encode(req.body.password);
        const phone = req.body.phone;
        const avatar = req.files["avatar"][0].path;
        const coverPhoto = req.files["coverPhoto"][0].path;
        const bio = req.body.bio;
        const status = req.body.status;
        const [userSlugExists, userEmailExists, userPhoneExists] = yield Promise.all([
            user_service_1.default.findBySlug(slug),
            user_service_1.default.findByEmail(email),
            user_service_1.default.findByPhone(phone)
        ]);
        if (userSlugExists) {
            req.flash("error", "Có lỗi xảy ra!");
            return res.redirect("back");
        }
        if (userEmailExists) {
            req.flash("error", "Email đã tồn tại!");
            return res.redirect("back");
        }
        if (userPhoneExists) {
            req.flash("error", "Số điện thoại đã tồn tại!");
            return res.redirect("back");
        }
        yield user_service_1.default.create({
            fullName,
            slug,
            email,
            password,
            phone,
            avatar,
            coverPhoto,
            bio,
            status: status,
            friends: [],
            friendAccepts: [],
            friendRequests: [],
            online: user_enum_1.EUserOnline.offline,
            deleted: false
        });
        req.flash("success", "Người dùng được tạo thành công!");
        return res.redirect(`/${index_config_1.default.admin}/users`);
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [GET] /admin/users/update/:id
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("userUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/users`);
        }
        const id = req.params.id;
        const userExists = yield user_service_1.default.findById(id);
        if (!userExists) {
            req.flash("error", "Người dùng không tồn tại!");
            return res.redirect("back");
        }
        return res.render("admin/pages/users/update", {
            pageTitle: "Cập Nhật Người Dùng",
            user: userExists
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [PATCH] /admin/users/update/:id
const updatePatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("userUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/users`);
        }
        const id = req.params.id;
        const fullName = req.body.fullName;
        const slug = slug_util_1.default.convert(fullName) + '-' + shortUniqueKey_util_1.default.generate();
        const email = req.body.email;
        const phone = req.body.phone;
        const status = req.body.status;
        const bio = req.body.bio;
        let avatar = undefined;
        if (req.files["avatar"]) {
            avatar = req.files["avatar"][0].path;
        }
        let coverPhoto = undefined;
        if (req.files["coverPhoto"]) {
            coverPhoto = req.files["coverPhoto"][0].path;
        }
        const [userIdExists, userSlugExists, userEmailExists, userPhoneExists,] = yield Promise.all([
            user_service_1.default.findById(id),
            user_service_1.default.findBySlug(slug),
            user_service_1.default.findByEmail(email),
            user_service_1.default.findByPhone(phone),
        ]);
        if (!userIdExists) {
            req.flash("error", "Người dùng không tồn tại!");
            return res.redirect("back");
        }
        if (userSlugExists) {
            req.flash("error", "Có lỗi xảy ra!");
            return res.redirect("back");
        }
        if (userEmailExists &&
            userEmailExists.id !== id) {
            req.flash("error", "Email đã tồn tại!");
            return res.redirect("back");
        }
        if (userPhoneExists &&
            userPhoneExists.id !== id) {
            req.flash("error", "Số điện thoại đã tồn tại!");
            return res.redirect("back");
        }
        yield user_service_1.default.update(id, {
            fullName,
            slug,
            email,
            phone,
            avatar,
            coverPhoto,
            bio,
            status: status
        });
        req.flash("success", "Người dùng được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [PATCH] /admin/users/actions
const actions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        const action = req.body.action;
        const ids = req.body.ids.split(',');
        switch (action) {
            case "delete": {
                if (!myAccount.permissions.includes("userDelete")) {
                    req.flash("error", "Bạn không có quyền!");
                    return res.redirect(`/${index_config_1.default.admin}/users`);
                }
                yield Promise.all(ids.map(id => user_service_1.default.del(id)));
                break;
            }
            case "active": {
                if (!myAccount.permissions.includes("userUpdate")) {
                    req.flash("error", "Bạn không có quyền!");
                    return res.redirect(`/${index_config_1.default.admin}/users`);
                }
                yield Promise.all(ids.map(id => user_service_1.default.update(id, { status: user_enum_1.EUserStatus.active })));
                break;
            }
            case "inactive": {
                if (!myAccount.permissions.includes("userUpdate")) {
                    req.flash("error", "Bạn không có quyền!");
                    return res.redirect(`/${index_config_1.default.admin}/users`);
                }
                yield Promise.all(ids.map(id => user_service_1.default.update(id, { status: user_enum_1.EUserStatus.inactive })));
                break;
            }
            default: {
                req.flash("error", "Hành động không chính xác!");
                return res.redirect("back");
            }
        }
        req.flash("success", "Các người dùng được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [PATCH] /admin/users/updateStatus/:status/:id
const updateStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("userUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/users`);
        }
        const id = req.params.id;
        const status = req.params.status;
        const userExists = yield user_service_1.default.findById(id);
        if (!userExists) {
            req.flash("error", "Người dùng không tồn tại!");
            return res.redirect("back");
        }
        yield user_service_1.default.update(id, { status: status });
        req.flash("success", "Người dùng được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [DELETE] /admin/users/delete/:id
const del = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("userDelete")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/users`);
        }
        const id = req.params.id;
        const userExists = yield user_service_1.default.findById(id);
        if (!userExists) {
            req.flash("error", "Người dùng không tồn tại!");
            return res.redirect("back");
        }
        yield user_service_1.default.del(id);
        req.flash("success", "Người dùng được xóa thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
const userController = {
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
exports.default = userController;
