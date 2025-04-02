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
const articleUser_enum_1 = require("../../enums/articleUser.enum");
const getUrl_helper_1 = __importDefault(require("../../helpers/getUrl.helper"));
const articleUser_service_1 = __importDefault(require("../../services/admin/articleUser.service"));
const user_service_1 = __importDefault(require("../../services/admin/user.service"));
const slug_util_1 = __importDefault(require("../../utils/slug.util"));
const shortUniqueKey_util_1 = __importDefault(require("../../utils/shortUniqueKey.util"));
// [GET] /admin/articleUsers?page=:page&limit=:limit&keyword=:keyword&sort=:sort&filter=:filter
const get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("articleUserView")) {
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
            { value: "title-asc", title: "Tiêu đề bài viết người dùng tăng dần" },
            { value: "title-desc", title: "Tiêu đề bài viết người dùng giảm dần" }
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
        const [maxPage, articleUsers] = yield Promise.all([
            articleUser_service_1.default.calculateMaxPage(limit),
            articleUser_service_1.default.find(req)
        ]);
        const users = yield Promise.all(articleUsers.map(articleUser => user_service_1.default.findById(articleUser.createdBy.userId)));
        return res.render("admin/pages/articleUsers", {
            pageTitle: "Danh Sách Bài Viết Người Dùng",
            url: (0, getUrl_helper_1.default)(req),
            articleUsers,
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
// [GET] /admin/articleUsers/detail/:id
const getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("articleUserView")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/articleUsers`);
        }
        const id = req.params.id;
        const articleUserExists = yield articleUser_service_1.default.findById(id);
        if (!articleUserExists) {
            req.flash("error", "Bài viểt người dùng không tồn tại!");
            return res.redirect("back");
        }
        const users = yield user_service_1.default.findAll();
        return res.render("admin/pages/articleUsers/detail", {
            pageTitle: "Chi Tiết Bài Viết Người Dùng",
            articleUser: articleUserExists,
            users
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [GET] /admin/articleUsers/create
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("articleUserCreate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/articleUsers`);
        }
        const users = yield user_service_1.default.findAll();
        return res.render("admin/pages/articleUsers/create", {
            pageTitle: "Tạo Mới Bài Viết Người Dùng",
            users
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [POST] /admin/articleUsers/create
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("articleUserCreate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/articleUsers`);
        }
        const title = req.body.title;
        const slug = slug_util_1.default.convert(title) + '-' + shortUniqueKey_util_1.default.generate();
        const description = req.body.description;
        const images = req.files["images"];
        const videos = req.files["videos"];
        const status = req.body.status;
        const userId = req.body.userId;
        const [articleUserSlugExists, userExists] = yield Promise.all([
            articleUser_service_1.default.findBySlug(slug),
            user_service_1.default.findById(userId)
        ]);
        if (articleUserSlugExists) {
            req.flash("error", "Có lỗi xảy ra!");
            return res.redirect("back");
        }
        if (!userExists) {
            req.flash("error", "Người dùng không tồn tại!");
            return res.redirect("back");
        }
        const createdBy = {
            userId,
            createdAt: new Date()
        };
        const imagePaths = (images || []).map(image => image.path);
        const videoPaths = (videos || []).map(video => video.path);
        yield articleUser_service_1.default.create({
            title,
            slug,
            description,
            images: imagePaths,
            videos: videoPaths,
            status,
            createdBy,
            deleted: false
        });
        req.flash("success", "Bài viết người dùng được tạo thành công!");
        return res.redirect(`/${index_config_1.default.admin}/articleUsers`);
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [GET] /admin/articleUsers/update/:id
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("articleUserUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/articleUsers`);
        }
        const id = req.params.id;
        const articleUserExists = yield articleUser_service_1.default.findById(id);
        if (!articleUserExists) {
            req.flash("error", "Bài viểt người dùng không tồn tại!");
            return res.redirect("back");
        }
        const users = yield user_service_1.default.findAll();
        return res.render("admin/pages/articleUsers/update", {
            pageTitle: "Cập Nhật Bài Viết Người Dùng",
            articleUser: articleUserExists,
            users
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [PATCH] /admin/articleUsers/update/:id
const updatePatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("articleUserUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/articleUsers`);
        }
        const id = req.params.id;
        const title = req.body.title;
        const slug = slug_util_1.default.convert(title) + '-' + shortUniqueKey_util_1.default.generate();
        const description = req.body.description;
        const images = req.files["images"];
        const videos = req.files["videos"];
        const status = req.body.status;
        const userId = req.body.userId;
        const [articleUserExists, articleUserSlugExists, userExists] = yield Promise.all([
            articleUser_service_1.default.findById(id),
            articleUser_service_1.default.findBySlug(slug),
            user_service_1.default.findById(userId)
        ]);
        if (!articleUserExists) {
            req.flash("error", "Bài viết người dùng không tồn tại!");
            return res.redirect("back");
        }
        if (articleUserSlugExists) {
            req.flash("error", "Có lỗi xảy ra!");
            return res.redirect("back");
        }
        if (!userExists) {
            req.flash("error", "Người dùng không tồn tại!");
            return res.redirect("back");
        }
        const createdBy = {
            userId,
            createdAt: new Date()
        };
        const imagePaths = (images || []).map(image => image.path);
        const videoPaths = (videos || []).map(video => video.path);
        yield articleUser_service_1.default.update(id, {
            title,
            slug,
            description,
            images: images ? imagePaths : undefined,
            videos: videos ? videoPaths : undefined,
            status,
            createdBy,
            deleted: false
        });
        req.flash("success", "Bài viết người dùng được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [PATCH] /admin/articleUsers/actions
const actions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        const action = req.body.action;
        const ids = req.body.ids.split(',');
        switch (action) {
            case "delete": {
                if (!myAccount.permissions.includes("articleUserDelete")) {
                    req.flash("error", "Bạn không có quyền!");
                    return res.redirect(`/${index_config_1.default.admin}/articleUsers`);
                }
                yield Promise.all(ids.map(id => articleUser_service_1.default.del(id)));
                break;
            }
            case "active": {
                if (!myAccount.permissions.includes("articleUserUpdate")) {
                    req.flash("error", "Bạn không có quyền!");
                    return res.redirect(`/${index_config_1.default.admin}/articleUsers`);
                }
                yield Promise.all(ids.map(id => articleUser_service_1.default.update(id, { status: articleUser_enum_1.EArticleUserStatus.active })));
                break;
            }
            case "inactive": {
                if (!myAccount.permissions.includes("articleUserUpdate")) {
                    req.flash("error", "Bạn không có quyền!");
                    return res.redirect(`/${index_config_1.default.admin}/articleUsers`);
                }
                yield Promise.all(ids.map(id => articleUser_service_1.default.update(id, { status: articleUser_enum_1.EArticleUserStatus.inactive })));
                break;
            }
            default: {
                req.flash("error", "Hành động không chính xác!");
                return res.redirect("back");
            }
        }
        req.flash("success", "Các bài viết người dùng được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [PATCH] /admin/articleUsers/updateStatus/:status/:id
const updateStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("articleUserUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/articleUsers`);
        }
        const id = req.params.id;
        const status = req.params.status;
        const articleUserExists = yield articleUser_service_1.default.findById(id);
        if (!articleUserExists) {
            req.flash("error", "Bài viết người dùng không tồn tại!");
            return res.redirect("back");
        }
        yield articleUser_service_1.default.update(id, { status });
        req.flash("success", "Bài viết người dùng được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [DELETE] /admin/articleUsers/delete/:id
const del = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("articleUserDelete")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/articleUsers`);
        }
        const id = req.params.id;
        const articleUserExists = yield articleUser_service_1.default.findById(id);
        if (!articleUserExists) {
            req.flash("error", "Bài viết người dùng không tồn tại!");
            return res.redirect("back");
        }
        yield articleUser_service_1.default.del(id);
        req.flash("success", "Bài viết người dùng được xóa thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
const articleUserController = {
    get,
    getById,
    create,
    createPost,
    update,
    actions,
    updatePatch,
    updateStatus,
    del
};
exports.default = articleUserController;
