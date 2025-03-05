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
const groupTopic_service_1 = __importDefault(require("../../services/admin/groupTopic.service"));
const slug_util_1 = __importDefault(require("../../utils/slug.util"));
const shortUniqueKey_util_1 = __importDefault(require("../../utils/shortUniqueKey.util"));
// [GET] /admin/groupTopics
const get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("groupTopicView")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/dashboard`);
        }
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
        const [maxPage, groupTopics] = yield Promise.all([
            groupTopic_service_1.default.calculateMaxPage(limit),
            groupTopic_service_1.default.find(req)
        ]);
        return res.render("admin/pages/groupTopics", {
            pageTitle: "Danh Sách Chủ Đề Cộng Đồng",
            url: (0, getUrl_helper_1.default)(req),
            groupTopics,
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
// [GET] /admin/groupTopics/detail/:id
const getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("groupTopicView")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/dashboard`);
        }
        const id = req.params.id;
        const groupTopicExists = yield groupTopic_service_1.default.findById(id);
        if (!groupTopicExists) {
            req.flash("error", "Chủ đề cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        return res.render("admin/pages/groupTopics/detail", {
            pageTitle: "Chi Tiết Chủ Đề Cộng Đồng",
            groupTopic: groupTopicExists
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [GET] /admin/groupTopics/create
const create = (req, res) => {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("groupTopicCreate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/groupTopics`);
        }
        return res.render("admin/pages/groupTopics/create", {
            pageTitle: "Tạo Mới Chủ Đề Cộng Đồng",
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
};
// [POST] /admin/groupTopics/create
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("groupTopicCreate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/groupTopics`);
        }
        const title = req.body.title;
        const slug = slug_util_1.default.convert(title) + '-' + shortUniqueKey_util_1.default.generate();
        const description = req.body.description;
        const groupTopicSlugExists = yield groupTopic_service_1.default.findBySlug(slug);
        if (groupTopicSlugExists) {
            req.flash("error", "Có lỗi xảy ra!");
            return res.redirect("back");
        }
        yield groupTopic_service_1.default.create({
            title,
            slug,
            description,
            deleted: false
        });
        req.flash("success", "Chủ đề cộng đồng được tạo thành công!");
        return res.redirect(`/${index_config_1.default.admin}/groupTopics`);
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [GET] /admin/groupTopics/update/:id
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("groupTopicUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/groupTopics`);
        }
        const id = req.params.id;
        const groupTopicExists = yield groupTopic_service_1.default.findById(id);
        if (!groupTopicExists) {
            req.flash("error", "Chủ đề cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        return res.render("admin/pages/groupTopics/update", {
            pageTitle: "Cập Nhật Chủ Đề Cộng Đồng",
            groupTopic: groupTopicExists
        });
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
        return res.redirect("back");
    }
});
// [PATCH] /admin/groupTopics/update/:id
const updatePatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("groupTopicUpdate")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/groupTopics`);
        }
        const id = req.params.id;
        const title = req.body.title;
        const slug = slug_util_1.default.convert(title) + '-' + shortUniqueKey_util_1.default.generate();
        const description = req.body.description;
        const [groupTopicIdExists, groupTopicSlugExists] = yield Promise.all([
            groupTopic_service_1.default.findById(id),
            groupTopic_service_1.default.findBySlug(slug),
        ]);
        if (!groupTopicIdExists) {
            req.flash("error", "Chủ đề cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        if (groupTopicSlugExists) {
            req.flash("error", "Có lỗi xảy ra!");
            return res.redirect("back");
        }
        yield groupTopic_service_1.default.update(id, {
            title,
            slug,
            description
        });
        req.flash("success", "Chủ đề cộng đồng được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [PATCH] /admin/groupTopics/actions
const actions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        const action = req.body.action;
        const ids = req.body.ids.split(',');
        switch (action) {
            case "delete": {
                if (!myAccount.permissions.includes("groupTopicDelete")) {
                    req.flash("error", "Bạn không có quyền!");
                    return res.redirect(`/${index_config_1.default.admin}/groupTopics`);
                }
                yield Promise.all(ids.map(id => groupTopic_service_1.default.del(id)));
                break;
            }
            default: {
                req.flash("error", "Hành động không chính xác!");
                return res.redirect("back");
            }
        }
        req.flash("success", "Các chủ đề cộng đồng được cập nhật thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
// [DELETE] /admin/groupTopics/delete/:id
const del = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("groupTopicDelete")) {
            req.flash("error", "Bạn không có quyền!");
            return res.redirect(`/${index_config_1.default.admin}/groupTopics`);
        }
        const id = req.params.id;
        const groupTopicExists = yield groupTopic_service_1.default.findById(id);
        if (!groupTopicExists) {
            req.flash("error", "Chủ đề cộng đồng không tồn tại!");
            return res.redirect("back");
        }
        yield groupTopic_service_1.default.del(id);
        req.flash("success", "Chủ đề cộng đồng được xóa thành công!");
    }
    catch (_a) {
        req.flash("error", "Có lỗi xảy ra!");
    }
    return res.redirect("back");
});
const groupTopicController = {
    get,
    getById,
    create,
    createPost,
    update,
    updatePatch,
    actions,
    del
};
exports.default = groupTopicController;
