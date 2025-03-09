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
const group_enum_1 = require("../../enums/group.enum");
const getUrl_helper_1 = __importDefault(require("../../helpers/getUrl.helper"));
const group_service_1 = __importDefault(require("../../services/admin/group.service"));
const user_service_1 = __importDefault(require("../../services/admin/user.service"));
const groupTopic_service_1 = __importDefault(require("../../services/admin/groupTopic.service"));
const slug_util_1 = __importDefault(require("../../utils/slug.util"));
const shortUniqueKey_util_1 = __importDefault(require("../../utils/shortUniqueKey.util"));
// [GET] /admin/groups?page=:page&limit=:limit&keyword=:keyword&sort=:sort&filter=:filter
const get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("groupView")) {
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
            { value: "title-asc", title: "Tiêu đề cộng đồng tăng dần" },
            { value: "title-desc", title: "Tiêu đề cộng đồng giảm dần" }
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
        const [maxPage, groups] = yield Promise.all([
            group_service_1.default.calculateMaxPage(limit),
            group_service_1.default.find(req)
        ]);
        const groupTopics = yield Promise.all(groups.map(group => groupTopic_service_1.default.findById(group.groupTopicId)));
        return res.render("admin/pages/groups", {
            pageTitle: "Danh Sách Cộng Đồng",
            url: (0, getUrl_helper_1.default)(req),
            groups,
            groupTopics,
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
// [GET] /admin/groups/detail/:id
const getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("groupView")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/dashboard`);
        }
        const id = req.params.id;
        const groupExists = yield group_service_1.default.findById(id);
        if (!groupExists) {
            req.flash("error", "Cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        const [groupTopics, users, userRequests] = yield Promise.all([
            groupTopic_service_1.default.findAll(),
            Promise.all(groupExists.users.map(user => user_service_1.default.findById(user.userId).then(data => ({
                user: data,
                role: user.role
            })))),
            Promise.all(groupExists.userRequests.map(userRequest => user_service_1.default.findById(userRequest)))
        ]);
        return res.render("admin/pages/groups/detail", {
            pageTitle: "Chi Tiết Cộng Đồng",
            group: groupExists,
            groupTopics,
            users,
            userRequests
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [GET] /admin/groups/create
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("groupCreate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/groups`);
        }
        const [users, groupTopics] = yield Promise.all([
            user_service_1.default.findAll(),
            groupTopic_service_1.default.findAll()
        ]);
        return res.render("admin/pages/groups/create", {
            pageTitle: "Tạo Mới Cộng Đồng",
            users,
            groupTopics
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [POST] /admin/groups/create
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("groupCreate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/groups`);
        }
        const title = req.body.title;
        const slug = slug_util_1.default.convert(title) + '-' + shortUniqueKey_util_1.default.generate();
        const description = req.body.description;
        const avatar = req.files["avatar"][0].path;
        const coverPhoto = req.files["coverPhoto"][0].path;
        const status = req.body.status;
        const userId = req.body.userId;
        const groupTopicId = req.body.groupTopicId;
        const [groupSlugExists, userExists, groupTopicExists] = yield Promise.all([
            group_service_1.default.findBySlug(slug),
            user_service_1.default.findById(userId),
            groupTopic_service_1.default.findById(groupTopicId)
        ]);
        if (groupSlugExists) {
            req.flash("error", "Có lỗi xảy ra!");
            return res.redirect("back");
        }
        if (!userExists) {
            req.flash("error", "Người dùng không tồn tại!");
            return res.redirect("back");
        }
        if (!groupTopicExists) {
            req.flash("error", "Chủ đề cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        const users = [{ userId, role: group_enum_1.EGroupRole.superAdmin }];
        yield group_service_1.default.create({
            title,
            slug,
            description,
            avatar,
            coverPhoto,
            status,
            users,
            userRequests: [],
            groupTopicId,
            deleted: false
        });
        req.flash("success", "Cộng đồng được tạo thành công!");
        return res.redirect(`/${index_config_1.default.admin}/groups`);
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [GET] /admin/groups/update/:id
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("groupUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/groups`);
        }
        const id = req.params.id;
        const groupExists = yield group_service_1.default.findById(id);
        if (!groupExists) {
            req.flash("error", "Cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        const [groupTopics, users, userRequests] = yield Promise.all([
            groupTopic_service_1.default.findAll(),
            Promise.all(groupExists.users.map(user => user_service_1.default.findById(user.userId).then(data => ({
                user: data,
                role: user.role
            })))),
            Promise.all(groupExists.userRequests.map(userRequest => user_service_1.default.findById(userRequest)))
        ]);
        return res.render("admin/pages/groups/update", {
            pageTitle: "Cập Nhật Cộng Đồng",
            group: groupExists,
            groupTopics,
            users,
            userRequests
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [PATCH] /admin/groups/update/:id
const updatePatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("groupUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/groups`);
        }
        const id = req.params.id;
        const title = req.body.title;
        const slug = slug_util_1.default.convert(title) + '-' + shortUniqueKey_util_1.default.generate();
        const description = req.body.description;
        const status = req.body.status;
        const groupTopicId = req.body.groupTopicId;
        let avatar = undefined;
        if (req.files["avatar"]) {
            avatar = req.files["avatar"][0].path;
        }
        let coverPhoto = undefined;
        if (req.files["coverPhoto"]) {
            coverPhoto = req.files["coverPhoto"][0].path;
        }
        const [groupExists, groupSlugExists, groupTopicExists] = yield Promise.all([
            group_service_1.default.findById(id),
            group_service_1.default.findBySlug(slug),
            groupTopic_service_1.default.findById(groupTopicId)
        ]);
        if (!groupExists) {
            req.flash("error", "Cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        if (groupSlugExists) {
            req.flash("error", "Có lỗi xảy ra!");
            return res.redirect("back");
        }
        if (!groupTopicExists) {
            req.flash("error", "Chủ đề cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        yield group_service_1.default.update(id, {
            title,
            slug,
            description,
            avatar,
            coverPhoto,
            status,
            groupTopicId
        });
        req.flash("success", "Cộng đồng được cập nhật thành công!");
    }
    catch (e) {
        console.log(e);
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [PATCH] /admin/groups/changeUserRole/:role/:userId/:id
const changeUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("groupUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/dashboard`);
        }
        const id = req.params.id;
        const userId = req.params.userId;
        const role = req.params.role;
        const [groupExists, userExists] = yield Promise.all([
            group_service_1.default.findById(id),
            user_service_1.default.findById(userId)
        ]);
        if (!groupExists) {
            req.flash("error", "Cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        if (!userExists) {
            req.flash("error", "Người dùng không tồn tại!");
            return res.redirect("back");
        }
        yield group_service_1.default.changeUserRole(id, userId, role);
        req.flash("success", "Vai trò người dùng được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [PATCH] /admin/groups/acceptUser/:userId/:id
const acceptUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("groupUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/dashboard`);
        }
        const id = req.params.id;
        const userId = req.params.userId;
        const [groupExists, userExists, groupUserExists] = yield Promise.all([
            group_service_1.default.findById(id),
            user_service_1.default.findById(userId),
            group_service_1.default.findUserInGroup(id, userId)
        ]);
        if (!groupExists) {
            req.flash("error", "Cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        if (!userExists) {
            req.flash("error", "Người dùng không tồn tại!");
            return res.redirect("back");
        }
        if (groupUserExists) {
            req.flash("error", "Người dùng đã tồn tại trong cộng đồng!");
            return res.redirect("back");
        }
        yield group_service_1.default.acceptUser(id, userId);
        yield group_service_1.default.delUserRequest(id, userId);
        req.flash("success", "Người dùng được thêm vào cộng đồng thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [PATCH] /admin/groups/actions
const actions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        const action = req.body.action;
        const ids = req.body.ids.split(',');
        switch (action) {
            case "delete": {
                if (!myAccount.permissions.includes("groupDelete")) {
                    req.flash("error", "Bạn không có quyền!");
                    return res.redirect(`/${index_config_1.default.admin}/groups`);
                }
                yield Promise.all(ids.map(id => group_service_1.default.del(id)));
                break;
            }
            case "active": {
                if (!myAccount.permissions.includes("groupUpdate")) {
                    req.flash("error", "Bạn không có quyền!");
                    return res.redirect(`/${index_config_1.default.admin}/groups`);
                }
                yield Promise.all(ids.map(id => group_service_1.default.update(id, { status: group_enum_1.EGroupStatus.active })));
                break;
            }
            case "inactive": {
                if (!myAccount.permissions.includes("groupUpdate")) {
                    req.flash("error", "Bạn không có quyền!");
                    return res.redirect(`/${index_config_1.default.admin}/groups`);
                }
                yield Promise.all(ids.map(id => group_service_1.default.update(id, { status: group_enum_1.EGroupStatus.inactive })));
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
// [PATCH] /admin/groups/updateStatus/:status/:id
const updateStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("groupUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/groups`);
        }
        const id = req.params.id;
        const status = req.params.status;
        const groupExists = yield group_service_1.default.findById(id);
        if (!groupExists) {
            req.flash("error", "Cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        yield group_service_1.default.update(id, { status });
        req.flash("success", "Cộng đồng được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [DELETE] /admin/groups/changeUserRole/:userId/:id
const delUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("groupUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/dashboard`);
        }
        const id = req.params.id;
        const userId = req.params.userId;
        const [groupExists, userExists] = yield Promise.all([
            group_service_1.default.findById(id),
            user_service_1.default.findById(userId)
        ]);
        if (!groupExists) {
            req.flash("error", "Cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        if (!userExists) {
            req.flash("error", "Người dùng không tồn tại!");
            return res.redirect("back");
        }
        yield group_service_1.default.delUser(id, userId);
        req.flash("success", "Người dùng được xóa thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [DELETE] /admin/groups/deleteUserRequest/:userId/:id
const delUserRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("groupUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/dashboard`);
        }
        const id = req.params.id;
        const userId = req.params.userId;
        const [groupExists, userExists] = yield Promise.all([
            group_service_1.default.findById(id),
            user_service_1.default.findById(userId)
        ]);
        if (!groupExists) {
            req.flash("error", "Cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        if (!userExists) {
            req.flash("error", "Người dùng không tồn tại!");
            return res.redirect("back");
        }
        yield group_service_1.default.delUserRequest(id, userId);
        req.flash("success", "Yêu cầu người dùng được xóa thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [DELETE] /admin/groups/delete/:id
const del = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("groupDelete")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/groups`);
        }
        const id = req.params.id;
        const groupExists = yield group_service_1.default.findById(id);
        if (!groupExists) {
            req.flash("error", "Cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        yield group_service_1.default.del(id);
        req.flash("success", "Cộng đồng được xóa thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
const groupController = {
    get,
    getById,
    create,
    createPost,
    update,
    updatePatch,
    changeUserRole,
    acceptUser,
    actions,
    updateStatus,
    delUser,
    delUserRequest,
    del
};
exports.default = groupController;
