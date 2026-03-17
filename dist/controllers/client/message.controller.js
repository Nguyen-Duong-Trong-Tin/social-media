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
const path_1 = __importDefault(require("path"));
const sort_helper_1 = __importDefault(require("../../helpers/sort.helper"));
const message_service_1 = __importDefault(require("../../services/client/message.service"));
const cloudinary_util_1 = require("../../utils/cloudinary.util");
const getSignedMaterialUrl = (url) => {
    if (!url)
        return "";
    return (0, cloudinary_util_1.buildSignedRawUrlFromSource)(url) || url;
};
const getSignedMaterialUrlFromFile = (file) => {
    if (!file)
        return "";
    const originalName = file.originalname || "";
    const ext = path_1.default.extname(originalName).toLowerCase();
    const format = ext ? ext.slice(1) : undefined;
    const publicId = file.filename || file.public_id;
    if (publicId) {
        return (0, cloudinary_util_1.buildSignedRawUrl)({ publicId, format });
    }
    const sourceUrl = file.path || file.secure_url;
    return (0, cloudinary_util_1.buildSignedRawUrlFromSource)(sourceUrl) || sourceUrl || "";
};
const normalizeMaterialUrls = (materials) => {
    return (materials || []).map(getSignedMaterialUrl).filter(Boolean);
};
// GET /v1/messages?sort&page&limit&filter
const find = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = req.query.filter;
        const sort = (0, sort_helper_1.default)(req);
        // const pagination = paginationHelper(req);
        const filterOptions = {};
        if (filter) {
            const { content, userId, roomChatId } = JSON.parse(filter);
            if (content) {
                filterOptions.title = new RegExp(content, "i");
            }
            if (userId) {
                filterOptions.userId = userId;
            }
            if (roomChatId) {
                filterOptions.roomChatId = roomChatId;
            }
        }
        const [total, items] = yield Promise.all([
            message_service_1.default.countDocumentsWithDeleted({ filter: filterOptions }),
            message_service_1.default.findWithDeleted({
                filter: filterOptions,
                // skip: pagination.skip,
                // limit: pagination.limit,
                sort,
            }),
        ]);
        const normalizedItems = items.map((item) => {
            const raw = item.toObject ? item.toObject() : item;
            return Object.assign(Object.assign({}, raw), { materials: normalizeMaterialUrls(raw.materials) });
        });
        return res.status(200).json({
            status: true,
            message: "Group topics found",
            data: {
                messages: {
                    total,
                    // page: pagination.page,
                    // limit: pagination.limit,
                    items: normalizedItems,
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
const messageController = {
    find,
    uploadImages: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const files = req.files || [];
            const images = files
                .map((file) => (file === null || file === void 0 ? void 0 : file.path) || (file === null || file === void 0 ? void 0 : file.secure_url))
                .filter(Boolean);
            if (!images.length) {
                return res.status(400).json({
                    status: false,
                    message: "No images uploaded",
                });
            }
            return res.status(200).json({
                status: true,
                message: "Images uploaded",
                data: { images },
            });
        }
        catch (_a) {
            return res.status(500).json({
                status: false,
                message: "Something went wrong",
            });
        }
    }),
    uploadVideos: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const files = req.files || [];
            const videos = files
                .map((file) => (file === null || file === void 0 ? void 0 : file.path) || (file === null || file === void 0 ? void 0 : file.secure_url))
                .filter(Boolean);
            if (!videos.length) {
                return res.status(400).json({
                    status: false,
                    message: "No videos uploaded",
                });
            }
            return res.status(200).json({
                status: true,
                message: "Videos uploaded",
                data: { videos },
            });
        }
        catch (_a) {
            return res.status(500).json({
                status: false,
                message: "Something went wrong",
            });
        }
    }),
    uploadMaterials: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const files = req.files || [];
            const materials = files
                .map((file) => getSignedMaterialUrlFromFile(file))
                .filter(Boolean);
            if (!materials.length) {
                return res.status(400).json({
                    status: false,
                    message: "No materials uploaded",
                });
            }
            return res.status(200).json({
                status: true,
                message: "Materials uploaded",
                data: { materials },
            });
        }
        catch (_a) {
            return res.status(500).json({
                status: false,
                message: "Something went wrong",
            });
        }
    }),
};
exports.default = messageController;
