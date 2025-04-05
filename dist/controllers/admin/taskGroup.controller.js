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
const taskGroup_enum_1 = require("../../enums/taskGroup.enum");
const getUrl_helper_1 = __importDefault(require("../../helpers/getUrl.helper"));
const group_service_1 = __importDefault(require("../../services/admin/group.service"));
const taskGroup_service_1 = __importDefault(require("../../services/admin/taskGroup.service"));
const user_service_1 = __importDefault(require("../../services/admin/user.service"));
const slug_util_1 = __importDefault(require("../../utils/slug.util"));
const shortUniqueKey_util_1 = __importDefault(require("../../utils/shortUniqueKey.util"));
// [GET] /admin/taskGroups?page=:page&limit=:limit&keyword=:keyword&sort=:sort&filter=:filter
const get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("taskGroupView")) {
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
            { value: "title-asc", title: "Tiêu đề nhiệm vụ cộng đồng tăng dần" },
            { value: "title-desc", title: "Tiêu đề nhiệm vụ cộng đồng giảm dần" },
        ];
        const keyword = req.query.keyword;
        const actionOptions = [
            { value: "", title: "---" },
            { value: "delete", title: "Xóa" },
            { value: "active", title: "Hoạt động" },
            { value: "inactive", title: "Ngưng hoạt động" },
        ];
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const [maxPage, taskGroups] = yield Promise.all([
            taskGroup_service_1.default.calculateMaxPage(limit),
            taskGroup_service_1.default.find(req),
        ]);
        const groups = yield Promise.all(taskGroups.map((taskGroup) => group_service_1.default.findById(taskGroup.groupId)));
        return res.render("admin/pages/taskGroups", {
            pageTitle: "Danh Sách Nhiệm Vụ Cộng Đồng",
            url: (0, getUrl_helper_1.default)(req),
            taskGroups,
            groups,
            filter: {
                filter,
                filterOptions,
            },
            sort: {
                sort,
                sortOptions,
            },
            keyword,
            actionOptions,
            pagination: {
                page,
                limit,
                maxPage,
            },
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [GET] /admin/taskGroups/detail/:id
const getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("taskGroupView")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/taskGroups`);
        }
        const id = req.params.id;
        const taskGroupExists = yield taskGroup_service_1.default.findById(id);
        if (!taskGroupExists) {
            req.flash("error", "Bài viểt cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        const [users, groups] = yield Promise.all([
            user_service_1.default.findAll(),
            group_service_1.default.findAll(),
        ]);
        return res.render("admin/pages/taskGroups/detail", {
            pageTitle: "Chi Tiết Nhiệm Vụ Cộng Đồng",
            taskGroup: taskGroupExists,
            groups,
            users,
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [GET] /admin/taskGroups/create
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("taskGroupCreate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/taskGroups`);
        }
        const [users, groups] = yield Promise.all([
            user_service_1.default.findAll(),
            group_service_1.default.findAll(),
        ]);
        return res.render("admin/pages/taskGroups/create", {
            pageTitle: "Tạo Mới Nhiệm Vụ Cộng Đồng",
            users,
            groups,
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [POST] /admin/taskGroups/create
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("taskGroupCreate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/taskGroups`);
        }
        const title = req.body.title;
        const slug = slug_util_1.default.convert(title) + "-" + shortUniqueKey_util_1.default.generate();
        const description = req.body.description;
        const images = req.files["images"];
        const videos = req.files["videos"];
        const status = req.body.status;
        const userId = req.body.userId;
        const groupId = req.body.groupId;
        const [taskGroupSlugExists, userExists, groupExists] = yield Promise.all([
            taskGroup_service_1.default.findBySlug(slug),
            user_service_1.default.findById(userId),
            group_service_1.default.findById(groupId),
        ]);
        if (taskGroupSlugExists) {
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
            createdAt: new Date(),
        };
        const imagePaths = (images || []).map((image) => image.path);
        const videoPaths = (videos || []).map((video) => video.path);
        yield taskGroup_service_1.default.create({
            title,
            slug,
            description,
            images: imagePaths,
            videos: videoPaths,
            status,
            groupId,
            createdBy,
            deleted: false,
        });
        req.flash("success", "Nhiệm vụ cộng đồng được tạo thành công!");
        return res.redirect(`/${index_config_1.default.admin}/taskGroups`);
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [GET] /admin/taskGroups/update/:id
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("taskGroupUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/taskGroups`);
        }
        const id = req.params.id;
        const taskGroupExists = yield taskGroup_service_1.default.findById(id);
        if (!taskGroupExists) {
            req.flash("error", "Bài viểt cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        const [users, groups] = yield Promise.all([
            user_service_1.default.findAll(),
            group_service_1.default.findAll(),
        ]);
        return res.render("admin/pages/taskGroups/update", {
            pageTitle: "Cập Nhật Nhiệm Vụ Cộng Đồng",
            taskGroup: taskGroupExists,
            groups,
            users,
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [PATCH] /admin/taskGroups/update/:id
const updatePatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("taskGroupUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/taskGroups`);
        }
        const id = req.params.id;
        const title = req.body.title;
        const slug = slug_util_1.default.convert(title) + "-" + shortUniqueKey_util_1.default.generate();
        const description = req.body.description;
        const images = req.files["images"];
        const videos = req.files["videos"];
        const status = req.body.status;
        const userId = req.body.userId;
        const groupId = req.body.groupId;
        const [taskGroupExists, taskGroupSlugExists, userExists, groupExists] = yield Promise.all([
            taskGroup_service_1.default.findById(id),
            taskGroup_service_1.default.findBySlug(slug),
            user_service_1.default.findById(userId),
            group_service_1.default.findById(groupId),
        ]);
        if (!taskGroupExists) {
            req.flash("error", "Nhiệm Vụ cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        if (taskGroupSlugExists) {
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
            createdAt: new Date(),
        };
        const imagePaths = (images || []).map((image) => image.path);
        const videoPaths = (videos || []).map((video) => video.path);
        yield taskGroup_service_1.default.update(id, {
            title,
            slug,
            description,
            images: images ? imagePaths : undefined,
            videos: videos ? videoPaths : undefined,
            status,
            groupId,
            createdBy,
            deleted: false,
        });
        req.flash("success", "Nhiệm Vụ cộng đồng được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [PATCH] /admin/taskGroups/actions
const actions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        const action = req.body.action;
        const ids = req.body.ids.split(",");
        switch (action) {
            case "delete": {
                if (!myAccount.permissions.includes("taskGroupDelete")) {
                    req.flash("error", "Bạn không có quyền!");
                    return res.redirect(`/${index_config_1.default.admin}/taskGroups`);
                }
                yield Promise.all(ids.map((id) => taskGroup_service_1.default.del(id)));
                break;
            }
            case "active": {
                if (!myAccount.permissions.includes("taskGroupUpdate")) {
                    req.flash("error", "Bạn không có quyền!");
                    return res.redirect(`/${index_config_1.default.admin}/taskGroups`);
                }
                yield Promise.all(ids.map((id) => taskGroup_service_1.default.update(id, { status: taskGroup_enum_1.ETaskGroupStatus.active })));
                break;
            }
            case "inactive": {
                if (!myAccount.permissions.includes("taskGroupUpdate")) {
                    req.flash("error", "Bạn không có quyền!");
                    return res.redirect(`/${index_config_1.default.admin}/taskGroups`);
                }
                yield Promise.all(ids.map((id) => taskGroup_service_1.default.update(id, { status: taskGroup_enum_1.ETaskGroupStatus.inactive })));
                break;
            }
            default: {
                req.flash("error", "Hành động không chính xác!");
                return res.redirect("back");
            }
        }
        req.flash("success", "Các nhiệm vụ cộng đồng được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [PATCH] /admin/taskGroups/updateStatus/:status/:id
const updateStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("taskGroupUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/taskGroups`);
        }
        const id = req.params.id;
        const status = req.params.status;
        const taskGroupExists = yield taskGroup_service_1.default.findById(id);
        if (!taskGroupExists) {
            req.flash("error", "Nhiệm vụ cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        yield taskGroup_service_1.default.update(id, { status });
        req.flash("success", "Nhiệm vụ cộng đồng được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [DELETE] /admin/taskGroups/delete/:id
const del = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("taskGroupDelete")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/taskGroups`);
        }
        const id = req.params.id;
        const taskGroupExists = yield taskGroup_service_1.default.findById(id);
        if (!taskGroupExists) {
            req.flash("error", "Nhiệm vụ cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        yield taskGroup_service_1.default.del(id);
        req.flash("success", "Nhiệm vụ cộng đồng được xóa thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
const taskGroupController = {
    get,
    getById,
    create,
    createPost,
    update,
    updatePatch,
    actions,
    updateStatus,
    del,
};
exports.default = taskGroupController;
