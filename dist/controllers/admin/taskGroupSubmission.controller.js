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
const taskGroupSubmission_enum_1 = require("../../enums/taskGroupSubmission.enum");
const getUrl_helper_1 = __importDefault(require("../../helpers/getUrl.helper"));
const user_service_1 = __importDefault(require("../../services/admin/user.service"));
const taskGroup_service_1 = __importDefault(require("../../services/admin/taskGroup.service"));
const taskGroupSubmission_service_1 = __importDefault(require("../../services/admin/taskGroupSubmission.service"));
const slug_util_1 = __importDefault(require("../../utils/slug.util"));
const shortUniqueKey_util_1 = __importDefault(require("../../utils/shortUniqueKey.util"));
// [GET] /admin/taskGroupSubmissions?page=:page&limit=:limit&keyword=:keyword&sort=:sort&filter=:filter
const get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("taskGroupSubmissionView")) {
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
            { value: "title-asc", title: "Tiêu đề nộp bài nhiệm vụ cộng đồng tăng dần" },
            { value: "title-desc", title: "Tiêu đề nộp bài nhiệm vụ cộng đồng giảm dần" },
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
        const [maxPage, taskGroupSubmissions] = yield Promise.all([
            taskGroupSubmission_service_1.default.calculateMaxPage(limit),
            taskGroupSubmission_service_1.default.find(req),
        ]);
        const taskGroups = yield Promise.all(taskGroupSubmissions.map((taskGroupSubmission) => taskGroup_service_1.default.findById(taskGroupSubmission.taskGroupId)));
        return res.render("admin/pages/taskGroupSubmissions", {
            pageTitle: "Danh Sách Nộp Bài Nhiệm Vụ Cộng Đồng",
            url: (0, getUrl_helper_1.default)(req),
            taskGroupSubmissions,
            taskGroups,
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
// [GET] /admin/taskGroupSubmissions/detail/:id
const getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("taskGroupSubmissionView")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/taskGroupSubmissions`);
        }
        const id = req.params.id;
        const taskGroupSubmissionExists = yield taskGroupSubmission_service_1.default.findById(id);
        if (!taskGroupSubmissionExists) {
            req.flash("error", "Nộp bài bài viểt cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        const [users, taskGroups] = yield Promise.all([
            user_service_1.default.findAll(),
            taskGroup_service_1.default.findAll(),
        ]);
        return res.render("admin/pages/taskGroupSubmissions/detail", {
            pageTitle: "Chi Tiết Nộp Bài Nhiệm Vụ Cộng Đồng",
            taskGroupSubmission: taskGroupSubmissionExists,
            taskGroups,
            users,
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [GET] /admin/taskGroupSubmissions/materials/:id
const watchMaterials = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("taskGroupSubmissionView")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/taskGroupSubmissions`);
        }
        const id = req.params.id;
        const taskGroupSubmissionExists = yield taskGroupSubmission_service_1.default.findById(id);
        if (!taskGroupSubmissionExists) {
            req.flash("error", "Nộp bài nhiệm vụ cộng đồng không tồn tại!");
            return req.redirect("back");
        }
        const materialPDFs = [];
        const materialDOCs = [];
        for (const material of taskGroupSubmissionExists.materials) {
            const array = material.split('.');
            const extension = array[array.length - 1];
            if (extension === "pdf") {
                materialPDFs.push(material);
            }
            else {
                materialDOCs.push(material);
            }
        }
        return res.render("admin/pages/taskGroupSubmissions/materials", {
            pageTitle: "Xem Tài Liệu Nộp Bài Nhiệm Vụ Cộng Đồng",
            taskGroupSubmission: taskGroupSubmissionExists,
            materialPDFs,
            materialDOCs
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("back");
    }
});
// [GET] /admin/taskGroupSubmissions/create
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("taskGroupSubmissionCreate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/taskGroupSubmissions`);
        }
        const [users, taskGroups] = yield Promise.all([
            user_service_1.default.findAll(),
            taskGroup_service_1.default.findAll(),
        ]);
        return res.render("admin/pages/taskGroupSubmissions/create", {
            pageTitle: "Tạo Mới Nộp Bài Nhiệm Vụ Cộng Đồng",
            users,
            taskGroups,
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [POST] /admin/taskGroupSubmissions/create
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("taskGroupSubmissionCreate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/taskGroupSubmissions`);
        }
        const title = req.body.title;
        const slug = slug_util_1.default.convert(title) + "-" + shortUniqueKey_util_1.default.generate();
        const description = req.body.description;
        const images = req.files["images"];
        const videos = req.files["videos"];
        const materials = req.files["materials"];
        const status = req.body.status;
        const userId = req.body.userId;
        const taskGroupId = req.body.taskGroupId;
        const [taskGroupSubmissionSlugExists, userExists, taskGroupExists] = yield Promise.all([
            taskGroupSubmission_service_1.default.findBySlug(slug),
            user_service_1.default.findById(userId),
            taskGroup_service_1.default.findById(taskGroupId),
        ]);
        if (taskGroupSubmissionSlugExists) {
            req.flash("error", "Có lỗi xảy ra!");
            return res.redirect("back");
        }
        if (!userExists) {
            req.flash("error", "Người dùng không tồn tại!");
            return res.redirect("back");
        }
        if (!taskGroupExists) {
            req.flash("error", "Nhiệm vụ cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        const createdBy = {
            userId,
            createdAt: new Date(),
        };
        const imagePaths = (images || []).map((image) => image.path);
        const videoPaths = (videos || []).map((video) => video.path);
        const materialPaths = (materials || []).map((material) => material.path);
        yield taskGroupSubmission_service_1.default.create({
            title,
            slug,
            description,
            images: imagePaths,
            videos: videoPaths,
            materials: materialPaths,
            status,
            taskGroupId,
            createdBy,
            deleted: false,
        });
        req.flash("success", "Nộp bài nhiệm vụ cộng đồng được tạo thành công!");
        return res.redirect(`/${index_config_1.default.admin}/taskGroupSubmissions`);
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [GET] /admin/taskGroupSubmissions/update/:id
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("taskGroupSubmissionUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/taskGroupSubmissions`);
        }
        const id = req.params.id;
        const taskGroupSubmissionExists = yield taskGroupSubmission_service_1.default.findById(id);
        if (!taskGroupSubmissionExists) {
            req.flash("error", "Nộp bài nhiệm vụ cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        const [users, taskGroups] = yield Promise.all([
            user_service_1.default.findAll(),
            taskGroup_service_1.default.findAll(),
        ]);
        return res.render("admin/pages/taskGroupSubmissions/update", {
            pageTitle: "Cập Nhật Nộp Bài Nhiệm Vụ Cộng Đồng",
            taskGroupSubmission: taskGroupSubmissionExists,
            taskGroups,
            users,
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [PATCH] /admin/taskGroupSubmissions/update/:id
const updatePatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("taskGroupSubmissionUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/taskGroupSubmissions`);
        }
        const id = req.params.id;
        const title = req.body.title;
        const slug = slug_util_1.default.convert(title) + "-" + shortUniqueKey_util_1.default.generate();
        const description = req.body.description;
        const images = req.files["images"];
        const videos = req.files["videos"];
        const materials = req.files["materials"];
        const status = req.body.status;
        const userId = req.body.userId;
        const taskGroupId = req.body.taskGroupId;
        const [taskGroupSubmissionExists, taskGroupSubmissionSlugExists, userExists, taskGroupExists] = yield Promise.all([
            taskGroupSubmission_service_1.default.findById(id),
            taskGroupSubmission_service_1.default.findBySlug(slug),
            user_service_1.default.findById(userId),
            taskGroup_service_1.default.findById(taskGroupId),
        ]);
        if (!taskGroupSubmissionExists) {
            req.flash("error", "Nộp bài nhiệm vụ cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        if (taskGroupSubmissionSlugExists) {
            req.flash("error", "Có lỗi xảy ra!");
            return res.redirect("back");
        }
        if (!userExists) {
            req.flash("error", "Người dùng không tồn tại!");
            return res.redirect("back");
        }
        if (!taskGroupExists) {
            req.flash("error", "Cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        const createdBy = {
            userId,
            createdAt: new Date(),
        };
        const imagePaths = (images || []).map((image) => image.path);
        const videoPaths = (videos || []).map((video) => video.path);
        const materialPaths = (materials || []).map((material) => material.path);
        yield taskGroupSubmission_service_1.default.update(id, {
            title,
            slug,
            description,
            images: images ? imagePaths : undefined,
            videos: videos ? videoPaths : undefined,
            materials: materials ? materialPaths : undefined,
            status,
            taskGroupId,
            createdBy,
            deleted: false,
        });
        req.flash("success", "Nộp bài nhiệm vụ cộng đồng được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [PATCH] /admin/taskGroupSubmissions/actions
const actions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        const action = req.body.action;
        const ids = req.body.ids.split(",");
        switch (action) {
            case "delete": {
                if (!myAccount.permissions.includes("taskGroupSubmissionDelete")) {
                    req.flash("error", "Bạn không có quyền!");
                    return res.redirect(`/${index_config_1.default.admin}/taskGroupSubmissions`);
                }
                yield Promise.all(ids.map((id) => taskGroupSubmission_service_1.default.del(id)));
                break;
            }
            case "active": {
                if (!myAccount.permissions.includes("taskGroupSubmissionUpdate")) {
                    req.flash("error", "Bạn không có quyền!");
                    return res.redirect(`/${index_config_1.default.admin}/taskGroupSubmissions`);
                }
                yield Promise.all(ids.map((id) => taskGroupSubmission_service_1.default.update(id, { status: taskGroupSubmission_enum_1.ETaskGroupSubmissionStatus.active })));
                break;
            }
            case "inactive": {
                if (!myAccount.permissions.includes("taskGroupSubmissionUpdate")) {
                    req.flash("error", "Bạn không có quyền!");
                    return res.redirect(`/${index_config_1.default.admin}/taskGroupSubmissions`);
                }
                yield Promise.all(ids.map((id) => taskGroupSubmission_service_1.default.update(id, { status: taskGroupSubmission_enum_1.ETaskGroupSubmissionStatus.inactive })));
                break;
            }
            default: {
                req.flash("error", "Hành động không chính xác!");
                return res.redirect("back");
            }
        }
        req.flash("success", "Các nộp bài nhiệm vụ cộng đồng được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [PATCH] /admin/taskGroupSubmissions/updateStatus/:status/:id
const updateStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("taskGroupSubmissionUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/taskGroupSubmissions`);
        }
        const id = req.params.id;
        const status = req.params.status;
        const taskGroupSubmissionExists = yield taskGroupSubmission_service_1.default.findById(id);
        if (!taskGroupSubmissionExists) {
            req.flash("error", "Nộp Bài nhiệm vụ cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        yield taskGroupSubmission_service_1.default.update(id, { status });
        req.flash("success", "Nộp Bài nhiệm vụ cộng đồng được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [DELETE] /admin/taskGroupSubmissions/delete/:id
const del = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("taskGroupSubmissionDelete")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/taskGroupSubmissions`);
        }
        const id = req.params.id;
        const taskGroupSubmissionExists = yield taskGroupSubmission_service_1.default.findById(id);
        if (!taskGroupSubmissionExists) {
            req.flash("error", "Nộp bài nhiệm vụ cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        yield taskGroupSubmission_service_1.default.del(id);
        req.flash("success", "Nộp bài nhiệm vụ cộng đồng được xóa thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
const taskGroupSubmissionController = {
    get,
    getById,
    watchMaterials,
    create,
    createPost,
    update,
    actions,
    updatePatch,
    updateStatus,
    del
};
exports.default = taskGroupSubmissionController;
