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
const articleGroup_enum_1 = require("../../enums/articleGroup.enum");
const getUrl_helper_1 = __importDefault(require("../../helpers/getUrl.helper"));
const group_service_1 = __importDefault(require("../../services/admin/group.service"));
const articleGroup_service_1 = __importDefault(require("../../services/admin/articleGroup.service"));
const user_service_1 = __importDefault(require("../../services/admin/user.service"));
const slug_util_1 = __importDefault(require("../../utils/slug.util"));
const shortUniqueKey_util_1 = __importDefault(require("../../utils/shortUniqueKey.util"));
// [GET] /admin/articleGroups?page=:page&limit=:limit&keyword=:keyword&sort=:sort&filter=:filter
const get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("articleGroupView")) {
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
            { value: "title-asc", title: "Tiêu đề bài viết cộng đồng tăng dần" },
            { value: "title-desc", title: "Tiêu đề bài viết cộng đồng giảm dần" }
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
        const [maxPage, articleGroups] = yield Promise.all([
            articleGroup_service_1.default.calculateMaxPage(limit),
            articleGroup_service_1.default.find(req)
        ]);
        const groups = yield Promise.all(articleGroups.map(articleGroup => group_service_1.default.findById(articleGroup.groupId)));
        return res.render("admin/pages/articleGroups", {
            pageTitle: "Danh Sách Bài Viết Cộng Đồng",
            url: (0, getUrl_helper_1.default)(req),
            articleGroups,
            groups,
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
// [GET] /admin/articleGroups/detail/:id
const getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("articleGroupView")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/articleGroups`);
        }
        const id = req.params.id;
        const articleGroupExists = yield articleGroup_service_1.default.findById(id);
        if (!articleGroupExists) {
            req.flash("error", "Bài viểt cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        const [users, groups] = yield Promise.all([
            user_service_1.default.findAll(),
            group_service_1.default.findAll()
        ]);
        return res.render("admin/pages/articleGroups/detail", {
            pageTitle: "Chi Tiết Bài Viết Cộng Đồng",
            articleGroup: articleGroupExists,
            groups,
            users
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [GET] /admin/articleGroups/create
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("articleGroupCreate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/articleGroups`);
        }
        const [users, groups] = yield Promise.all([
            user_service_1.default.findAll(),
            group_service_1.default.findAll()
        ]);
        return res.render("admin/pages/articleGroups/create", {
            pageTitle: "Tạo Mới Bài Viết Cộng Đồng",
            users,
            groups
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [POST] /admin/articleGroups/create
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("articleGroupCreate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/articleGroups`);
        }
        const title = req.body.title;
        const slug = slug_util_1.default.convert(title) + '-' + shortUniqueKey_util_1.default.generate();
        const description = req.body.description;
        const images = req.files["images"];
        const videos = req.files["videos"];
        const status = req.body.status;
        const userId = req.body.userId;
        const groupId = req.body.groupId;
        const [articleGroupSlugExists, userExists, groupExists] = yield Promise.all([
            articleGroup_service_1.default.findBySlug(slug),
            user_service_1.default.findById(userId),
            group_service_1.default.findById(groupId)
        ]);
        if (articleGroupSlugExists) {
            req.flash("error", "Có lỗi xảy ra!");
            return res.redirect("back");
        }
        if (!userExists) {
            req.flash("error", "Người dùng không tồn tại!");
            return res.redirect("back");
        }
        if (!groupExists) {
            req.flash("error", "Cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        const createdBy = {
            userId,
            createdAt: new Date()
        };
        const imagePaths = (images || []).map(image => image.path);
        const videoPaths = (videos || []).map(video => video.path);
        yield articleGroup_service_1.default.create({
            title,
            slug,
            description,
            images: imagePaths,
            videos: videoPaths,
            status,
            groupId,
            createdBy,
            deleted: false
        });
        req.flash("success", "Bài viết cộng đồng được tạo thành công!");
        return res.redirect(`/${index_config_1.default.admin}/articleGroups`);
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [GET] /admin/articleGroups/update/:id
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("articleGroupUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/articleGroups`);
        }
        const id = req.params.id;
        const articleGroupExists = yield articleGroup_service_1.default.findById(id);
        if (!articleGroupExists) {
            req.flash("error", "Bài viểt cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        const [users, groups] = yield Promise.all([
            user_service_1.default.findAll(),
            group_service_1.default.findAll()
        ]);
        return res.render("admin/pages/articleGroups/update", {
            pageTitle: "Cập Nhật Bài Viết Cộng Đồng",
            articleGroup: articleGroupExists,
            groups,
            users
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [POST] /admin/articleGroups/update/:id
const updatePatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("articleGroupUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/articleGroups`);
        }
        const id = req.params.id;
        const title = req.body.title;
        const slug = slug_util_1.default.convert(title) + '-' + shortUniqueKey_util_1.default.generate();
        const description = req.body.description;
        const images = req.files["images"];
        const videos = req.files["videos"];
        const status = req.body.status;
        const userId = req.body.userId;
        const groupId = req.body.groupId;
        const [articleGroupExists, articleGroupSlugExists, userExists, groupExists] = yield Promise.all([
            articleGroup_service_1.default.findById(id),
            articleGroup_service_1.default.findBySlug(slug),
            user_service_1.default.findById(userId),
            group_service_1.default.findById(groupId)
        ]);
        if (!articleGroupExists) {
            req.flash("error", "Bài viết cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        if (articleGroupSlugExists) {
            req.flash("error", "Có lỗi xảy ra!");
            return res.redirect("back");
        }
        if (!userExists) {
            req.flash("error", "Người dùng không tồn tại!");
            return res.redirect("back");
        }
        if (!groupExists) {
            req.flash("error", "Cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        const createdBy = {
            userId,
            createdAt: new Date()
        };
        const imagePaths = (images || []).map(image => image.path);
        const videoPaths = (videos || []).map(video => video.path);
        yield articleGroup_service_1.default.update(id, {
            title,
            slug,
            description,
            images: images ? imagePaths : undefined,
            videos: videos ? videoPaths : undefined,
            status,
            groupId,
            createdBy,
            deleted: false
        });
        req.flash("success", "Bài viết cộng đồng được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [PATCH] /admin/articleGroups/actions
const actions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        const action = req.body.action;
        const ids = req.body.ids.split(',');
        switch (action) {
            case "delete": {
                if (!myAccount.permissions.includes("articleGroupDelete")) {
                    req.flash("error", "Bạn không có quyền!");
                    return res.redirect(`/${index_config_1.default.admin}/articleGroups`);
                }
                yield Promise.all(ids.map(id => articleGroup_service_1.default.del(id)));
                break;
            }
            case "active": {
                if (!myAccount.permissions.includes("articleGroupUpdate")) {
                    req.flash("error", "Bạn không có quyền!");
                    return res.redirect(`/${index_config_1.default.admin}/articleGroups`);
                }
                yield Promise.all(ids.map(id => articleGroup_service_1.default.update(id, { status: articleGroup_enum_1.EArticleGroupStatus.active })));
                break;
            }
            case "inactive": {
                if (!myAccount.permissions.includes("articleGroupUpdate")) {
                    req.flash("error", "Bạn không có quyền!");
                    return res.redirect(`/${index_config_1.default.admin}/articleGroups`);
                }
                yield Promise.all(ids.map(id => articleGroup_service_1.default.update(id, { status: articleGroup_enum_1.EArticleGroupStatus.inactive })));
                break;
            }
            default: {
                req.flash("error", "Hành động không chính xác!");
                return res.redirect("back");
            }
        }
        req.flash("success", "Các cộng đồng được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [PATCH] /admin/articleGroups/updateStatus/:status/:id
const updateStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("articleGroupUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/articleGroups`);
        }
        const id = req.params.id;
        const status = req.params.status;
        const articleGroupExists = yield articleGroup_service_1.default.findById(id);
        if (!articleGroupExists) {
            req.flash("error", "Bài viết cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        yield articleGroup_service_1.default.update(id, { status });
        req.flash("success", "Bài viết cộng đồng được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [DELETE] /admin/articleGroups/delete/:id
const del = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("articleGroupDelete")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/articleGroups`);
        }
        const id = req.params.id;
        const articleGroupExists = yield articleGroup_service_1.default.findById(id);
        if (!articleGroupExists) {
            req.flash("error", "Bài viết cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        yield articleGroup_service_1.default.del(id);
        req.flash("success", "Bài viết cộng đồng được xóa thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
const articleGroupController = {
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
exports.default = articleGroupController;
