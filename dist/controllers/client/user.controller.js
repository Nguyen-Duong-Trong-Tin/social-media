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
const user_service_1 = __importDefault(require("../../services/client/user.service"));
const sort_helper_1 = __importDefault(require("../../helpers/sort.helper"));
const pagination_helper_1 = __importDefault(require("../../helpers/pagination.helper"));
// POST /v1/users/check-exists/email
const checkExistsEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const userExists = yield user_service_1.default.findOne({
            filter: { email },
            select: "-password",
        });
        if (!userExists) {
            return res.status(404).json({
                status: false,
                message: "User email not found",
            });
        }
        return res.status(200).json({
            status: true,
            message: "User found",
            data: userExists,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// POST /v1/users/check-exists/phone
const checkExistsPhone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone } = req.body;
        const userExists = yield user_service_1.default.findOne({
            filter: { phone },
            select: "-password",
        });
        if (!userExists) {
            return res.status(404).json({
                status: false,
                message: "User phone not found",
            });
        }
        return res.status(200).json({
            status: true,
            message: "User found",
            data: userExists,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// POST /v1/users/ids
const findUsersByIds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ids } = req.body;
        const users = yield user_service_1.default.find({
            filter: { _id: { $in: ids } },
            select: "-password",
        });
        const map = new Map();
        for (const user of users) {
            map.set(user.id, user);
        }
        const usersOrdered = ids
            .map((id) => { var _a; return (_a = map.get(id)) !== null && _a !== void 0 ? _a : null; })
            .filter(Boolean);
        return res.status(200).json({
            status: true,
            message: "Users found",
            data: usersOrdered,
        });
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// GET /v1/users?sort&page&limit&filter
const findUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = req.query.filter;
        const sort = (0, sort_helper_1.default)(req);
        const pagination = (0, pagination_helper_1.default)(req);
        const filterOptions = {};
        if (filter) {
            const { fullName, slug, notInIds } = JSON.parse(filter);
            if (fullName) {
                filterOptions.fullName = new RegExp(fullName, "i");
            }
            if (slug) {
                filterOptions.slug = new RegExp(slug, "i");
            }
            if (notInIds) {
                const ids = JSON.parse(notInIds);
                filterOptions["_id"] = { $nin: ids };
            }
        }
        const [total, items] = yield Promise.all([
            user_service_1.default.countDocuments({ filter: filterOptions }),
            user_service_1.default.find({
                filter: filterOptions,
                skip: pagination.skip,
                limit: pagination.limit,
                sort,
            }),
        ]);
        return res.status(200).json({
            status: true,
            message: "Users found",
            data: {
                users: {
                    total,
                    page: pagination.page,
                    limit: pagination.limit,
                    items,
                },
            },
        });
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// GET /v1/users/:id
const findUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userExists = yield user_service_1.default.findOne({ filter: { _id: id } });
        if (!userExists) {
            return res.status(404).json({
                status: false,
                message: "User id not found",
            });
        }
        return res.status(200).json({
            status: true,
            message: "User found",
            data: userExists,
        });
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// GET /v1/users/slug/:slug
const findUserBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const userExists = yield user_service_1.default.findOne({
            filter: { slug },
            select: "-password",
        });
        if (!userExists) {
            return res.status(404).json({
                status: false,
                message: "User slug not found",
            });
        }
        return res.status(200).json({
            status: true,
            message: "User found",
            data: userExists,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// PATCH /v1/users/bio/:id
const updateBio = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { bio } = req.body;
        const userExists = yield user_service_1.default.findOneAndUpdate({
            filter: { _id: id },
            update: { bio },
            select: "-password",
        });
        if (!userExists) {
            return res.status(404).json({
                status: false,
                message: "User id not found",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Update successfully",
            data: userExists,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// PATCH /v1/users/location/:id
const updateLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { lat, lng, visibility } = req.body;
        const updatePayload = {
            lastLocation: {
                lat,
                lng,
                updatedAt: new Date(),
            },
        };
        if (visibility) {
            updatePayload.locationVisibility = visibility;
        }
        const userExists = yield user_service_1.default.findOneAndUpdate({
            filter: { _id: id },
            update: updatePayload,
            select: "-password",
        });
        if (!userExists) {
            return res.status(404).json({
                status: false,
                message: "User id not found",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Location updated",
            data: userExists,
        });
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// GET /v1/users/locations
const findUsersWithLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const viewerId = req.query.viewerId;
        if (!viewerId) {
            return res.status(400).json({
                status: false,
                message: "Viewer id is required",
            });
        }
        const viewer = yield user_service_1.default.findOne({
            filter: { _id: viewerId },
            select: "friends locationVisibility",
        });
        if (!viewer) {
            return res.status(404).json({
                status: false,
                message: "User id not found",
            });
        }
        const friendIds = (viewer.friends || [])
            .map((friend) => friend.userId)
            .filter(Boolean);
        const visibility = viewer.locationVisibility || "friends";
        const filterOptions = {
            lastLocation: { $exists: true },
            _id: { $ne: viewerId },
        };
        if (visibility === "friends") {
            if (!friendIds.length) {
                return res.status(200).json({
                    status: true,
                    message: "Users found",
                    data: [],
                });
            }
            filterOptions["_id"] = { $in: friendIds };
        }
        else {
            if (friendIds.length) {
                filterOptions["$or"] = [
                    { locationVisibility: "everyone" },
                    { _id: { $in: friendIds } },
                ];
            }
            else {
                filterOptions["locationVisibility"] = "everyone";
            }
        }
        const users = yield user_service_1.default.find({
            filter: filterOptions,
            select: "fullName avatar lastLocation online slug",
            limit: 200,
        });
        return res.status(200).json({
            status: true,
            message: "Users found",
            data: users,
        });
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
const userController = {
    checkExistsEmail,
    checkExistsPhone,
    findUsers,
    findUserById,
    findUsersByIds,
    findUserBySlug,
    updateBio,
    updateLocation,
    findUsersWithLocation,
};
exports.default = userController;
