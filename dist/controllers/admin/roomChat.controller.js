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
const roomChat_enum_1 = require("../../enums/roomChat.enum");
const getUrl_helper_1 = __importDefault(require("../../helpers/getUrl.helper"));
const roomChat_service_1 = __importDefault(require("../../services/admin/roomChat.service"));
const user_service_1 = __importDefault(require("../../services/admin/user.service"));
const slug_util_1 = __importDefault(require("../../utils/slug.util"));
const shortUniqueKey_util_1 = __importDefault(require("../../utils/shortUniqueKey.util"));
// [GET] /admin/roomChats?page=:page&limit=:limit&keyword=:keyword&sort=:sort&filter=:filter
const get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("roomChatView")) {
            req.flash("error", "Access denied!");
            return res.redirect(`/${index_config_1.default.admin}/dashboard`);
        }
        const filter = req.query.filter;
        const filterOptions = [
            { value: "", title: "---" },
            { value: "type-group", title: "Group type" },
            { value: "type-friend", title: "Friend type" },
            { value: "status-active", title: "Active status" },
            { value: "status-inactive", title: "Inative status" },
        ];
        const sort = req.query.sort;
        const sortOptions = [
            { value: "", title: "---" },
            { value: "title-asc", title: "Title (A - Z)" },
            { value: "title-desc", title: "Title (Z - A)" }
        ];
        const keyword = req.query.keyword;
        const actionOptions = [
            { value: "", title: "---" },
            { value: "delete", title: "Delete" },
            { value: "active", title: "Active" },
            { value: "inactive", title: "Inactive" }
        ];
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const [maxPage, roomChats] = yield Promise.all([
            roomChat_service_1.default.calculateMaxPage(limit),
            roomChat_service_1.default.find(req)
        ]);
        return res.render("admin/pages/roomChats", {
            pageTitle: "List of room chats",
            url: (0, getUrl_helper_1.default)(req),
            roomChats,
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
        req.flash("error", "Something went wrong!");
        return res.redirect("back");
    }
});
// [GET] /admin/roomChats/detail/:id
const getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("roomChatView")) {
            req.flash("error", "Access denied!");
            return res.redirect(`/${index_config_1.default.admin}/dashboard`);
        }
        const id = req.params.id;
        const roomChatExists = yield roomChat_service_1.default.findById(id);
        if (!roomChatExists) {
            req.flash("error", "Room chat not found!");
            return res.redirect("back");
        }
        const [users, userRequests] = yield Promise.all([
            Promise.all(roomChatExists.users.map(user => user_service_1.default.findById(user.userId).then(data => ({
                user: data,
                role: user.role
            })))),
            Promise.all(roomChatExists.userRequests.map(userRequest => user_service_1.default.findById(userRequest)))
        ]);
        return res.render("admin/pages/roomChats/detail", {
            pageTitle: "Room chat details",
            roomChat: roomChatExists,
            users,
            userRequests
        });
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
        return res.redirect("back");
    }
});
// [GET] /admin/roomChats/create
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("roomChatCreate")) {
            req.flash("error", "Access denied!");
            return res.redirect(`/${index_config_1.default.admin}/roomChats`);
        }
        const users = yield user_service_1.default.findAll();
        return res.render("admin/pages/roomChats/create", {
            pageTitle: "Create new room chat",
            users
        });
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
        return res.redirect("back");
    }
});
// [POST] /admin/roomChats/create
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("roomChatCreate")) {
            req.flash("error", "Access denied!");
            return res.redirect(`/${index_config_1.default.admin}/roomChats`);
        }
        const title = req.body.title;
        const slug = slug_util_1.default.convert(title) + '-' + shortUniqueKey_util_1.default.generate();
        const type = roomChat_enum_1.ERoomChatType.group;
        const avatar = req.file.path;
        const status = req.body.status;
        const userId = req.body.userId;
        const [roomChatSlugExists, userExists] = yield Promise.all([
            roomChat_service_1.default.findBySlug(slug),
            user_service_1.default.findById(userId)
        ]);
        if (roomChatSlugExists) {
            req.flash("error", "Something went wrong!");
            return res.redirect("back");
        }
        if (!userExists) {
            req.flash("error", "User not found!");
            return res.redirect("back");
        }
        const users = [{ userId, role: roomChat_enum_1.ERoomChatRole.superAdmin }];
        yield roomChat_service_1.default.create({
            title,
            slug,
            type,
            avatar,
            status,
            users,
            userRequests: [],
            deleted: false
        });
        req.flash("success", "Room chat was created successfully!");
        return res.redirect(`/${index_config_1.default.admin}/roomChats`);
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
        return res.redirect("back");
    }
});
// [GET] /admin/roomChats/update/:id
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("roomChatUpdate")) {
            req.flash("error", "Access denied!");
            return res.redirect(`/${index_config_1.default.admin}/roomChats`);
        }
        const id = req.params.id;
        const roomChatExists = yield roomChat_service_1.default.findById(id);
        if (!roomChatExists) {
            req.flash("error", "Room chat not found!");
            return res.redirect("back");
        }
        if (roomChatExists.type === "friend") {
            req.flash("error", "Room chat of friend type cannot modified!");
            return res.redirect("back");
        }
        const [users, userRequests] = yield Promise.all([
            Promise.all(roomChatExists.users.map(user => user_service_1.default.findById(user.userId).then(data => ({
                user: data,
                role: user.role
            })))),
            Promise.all(roomChatExists.userRequests.map(userRequest => user_service_1.default.findById(userRequest)))
        ]);
        return res.render("admin/pages/roomChats/update", {
            pageTitle: "Update new room chat",
            roomChat: roomChatExists,
            users,
            userRequests
        });
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
        return res.redirect("back");
    }
});
// [PATCH] /admin/roomChats/update/:id
const updatePatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("roomChatUpdate")) {
            req.flash("error", "Access denied!");
            return res.redirect(`/${index_config_1.default.admin}/roomChats`);
        }
        const id = req.params.id;
        const title = req.body.title;
        const slug = slug_util_1.default.convert(title) + '-' + shortUniqueKey_util_1.default.generate();
        const status = req.body.status;
        let avatar = undefined;
        if (req.file) {
            avatar = req.file.path;
        }
        const [roomChatExists, roomChatSlugExists] = yield Promise.all([
            roomChat_service_1.default.findById(id),
            roomChat_service_1.default.findBySlug(slug)
        ]);
        if (!roomChatExists) {
            req.flash("error", "Room chat not found");
            return res.redirect("back");
        }
        if (roomChatExists.type === "friend") {
            req.flash("error", "Room chat of friend type cannot modified!");
            return res.redirect("back");
        }
        if (roomChatSlugExists) {
            req.flash("error", "Something went wrong!");
            return req.redirect("back");
        }
        yield roomChat_service_1.default.update(id, {
            title,
            slug,
            avatar,
            status
        });
        req.flash("success", "Room chat was updated successfully!");
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
    }
    return res.redirect("back");
});
// [PATCH] /admin/roomChats/changeUserRole/:role/:userId/:id
const changeUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("roomChatUpdate")) {
            req.flash("error", "Access denied!");
            return res.redirect(`/${index_config_1.default.admin}/dashboard`);
        }
        const id = req.params.id;
        const userId = req.params.userId;
        const role = req.params.role;
        const [roomChatExists, userExists] = yield Promise.all([
            roomChat_service_1.default.findById(id),
            user_service_1.default.findById(userId)
        ]);
        if (!roomChatExists) {
            req.flash("error", "Room chat not found");
            return res.redirect("back");
        }
        if (!userExists) {
            req.flash("error", "User not found!");
            return res.redirect("back");
        }
        yield roomChat_service_1.default.changeUserRole(id, userId, role);
        req.flash("success", "User role was updated successfully!");
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
    }
    return res.redirect("back");
});
// [PATCH] /admin/roomChats/acceptUser/:userId/:id
const acceptUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("roomChatUpdate")) {
            req.flash("error", "Access denied!");
            return res.redirect(`/${index_config_1.default.admin}/dashboard`);
        }
        const id = req.params.id;
        const userId = req.params.userId;
        const [roomChatExists, userExists, roomChatUserExists] = yield Promise.all([
            roomChat_service_1.default.findById(id),
            user_service_1.default.findById(userId),
            roomChat_service_1.default.findUserInRoomChat(id, userId)
        ]);
        if (!roomChatExists) {
            req.flash("error", "Room chat not found");
            return res.redirect("back");
        }
        if (!userExists) {
            req.flash("error", "User not found!");
            return res.redirect("back");
        }
        if (roomChatUserExists) {
            req.flash("error", "User is already in the room chat!");
            return res.redirect("back");
        }
        yield roomChat_service_1.default.acceptUser(id, userId);
        yield roomChat_service_1.default.delUserRequest(id, userId);
        req.flash("success", "User was added to the room chat successfully!");
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
    }
    return res.redirect("back");
});
// [PATCH] /admin/roomChats/actions
const actions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        const action = req.body.action;
        const ids = req.body.ids.split(',');
        switch (action) {
            case "delete": {
                if (!myAccount.permissions.includes("roomChatDelete")) {
                    req.flash("error", "Access denied!");
                    return res.redirect(`/${index_config_1.default.admin}/roomChats`);
                }
                yield Promise.all(ids.map(id => roomChat_service_1.default.del(id)));
                break;
            }
            case "active": {
                if (!myAccount.permissions.includes("roomChatUpdate")) {
                    req.flash("error", "Access denied!");
                    return res.redirect(`/${index_config_1.default.admin}/roomChats`);
                }
                yield Promise.all(ids.map(id => roomChat_service_1.default.update(id, { status: roomChat_enum_1.ERoomChatStatus.active })));
                break;
            }
            case "inactive": {
                if (!myAccount.permissions.includes("roomChatUpdate")) {
                    req.flash("error", "Access denied!");
                    return res.redirect(`/${index_config_1.default.admin}/roomChats`);
                }
                yield Promise.all(ids.map(id => roomChat_service_1.default.update(id, { status: roomChat_enum_1.ERoomChatStatus.inactive })));
                break;
            }
            default: {
                req.flash("error", "Action wrong!");
                return res.redirect("back");
            }
        }
        req.flash("success", "Room chats were updated successfully!");
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
    }
    return res.redirect("back");
});
// [PATCH] /admin/roomChats/updateStatus/:status/:id
const updateStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("roomChatUpdate")) {
            req.flash("error", "Access denied!");
            return res.redirect(`/${index_config_1.default.admin}/roomChats`);
        }
        const id = req.params.id;
        const status = req.params.status;
        const roomChatExists = yield roomChat_service_1.default.findById(id);
        if (!roomChatExists) {
            req.flash("error", "Room chat not found");
            return res.redirect("back");
        }
        yield roomChat_service_1.default.update(id, { status });
        req.flash("success", "Room chat was updated successfully!");
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
    }
    return res.redirect("back");
});
// [DELETE] /admin/roomChats/changeUserRole/:userId/:id
const delUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("roomChatUpdate")) {
            req.flash("error", "Access denied!");
            return res.redirect(`/${index_config_1.default.admin}/dashboard`);
        }
        const id = req.params.id;
        const userId = req.params.userId;
        const [roomChatExists, userExists] = yield Promise.all([
            roomChat_service_1.default.findById(id),
            user_service_1.default.findById(userId)
        ]);
        if (!roomChatExists) {
            req.flash("error", "Room chat not found");
            return res.redirect("back");
        }
        if (!userExists) {
            req.flash("error", "User not found!");
            return res.redirect("back");
        }
        yield roomChat_service_1.default.delUser(id, userId);
        req.flash("success", "User was deleted successfully!");
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
    }
    return res.redirect("back");
});
// [DELETE] /admin/roomChats/deleteUserRequest/:userId/:id
const delUserRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("roomChatUpdate")) {
            req.flash("error", "Access denied!");
            return res.redirect(`/${index_config_1.default.admin}/dashboard`);
        }
        const id = req.params.id;
        const userId = req.params.userId;
        const [roomChatExists, userExists] = yield Promise.all([
            roomChat_service_1.default.findById(id),
            user_service_1.default.findById(userId)
        ]);
        if (!roomChatExists) {
            req.flash("error", "Room chat not found");
            return res.redirect("back");
        }
        if (!userExists) {
            req.flash("error", "User not found!");
            return res.redirect("back");
        }
        yield roomChat_service_1.default.delUserRequest(id, userId);
        req.flash("success", "User request was deleted successfully!");
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
    }
    return res.redirect("back");
});
// [DELETE] /admin/roomChats/delete/:id
const del = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myAccount = res.locals.myAccount;
        if (!myAccount.permissions.includes("roomChatDelete")) {
            req.flash("error", "Access denied!");
            return res.redirect(`/${index_config_1.default.admin}/roomChats`);
        }
        const id = req.params.id;
        const roomChatExists = yield roomChat_service_1.default.findById(id);
        if (!roomChatExists) {
            req.flash("error", "Room chat not found");
            return res.redirect("back");
        }
        yield roomChat_service_1.default.del(id);
        req.flash("success", "Room chat was deleted successfully!");
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
    }
    return res.redirect("back");
});
const roomChatController = {
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
exports.default = roomChatController;
