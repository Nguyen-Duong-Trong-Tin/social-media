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
const sort_helper_1 = __importDefault(require("../../helpers/sort.helper"));
const pagination_helper_1 = __importDefault(require("../../helpers/pagination.helper"));
const groupTopic_service_1 = __importDefault(require("../../services/client/groupTopic.service"));
// GET /v1/groupTopics?sort&page&limit&filter
const find = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = req.query.filter;
        const sort = (0, sort_helper_1.default)(req);
        const pagination = (0, pagination_helper_1.default)(req);
        const filterOptions = {};
        if (filter) {
            const { title, slug, description } = JSON.parse(filter);
            if (title) {
                filterOptions.title = new RegExp(title, "i");
            }
            if (slug) {
                filterOptions.slug = new RegExp(slug, "i");
            }
            if (description) {
                filterOptions.description = new RegExp(description, "i");
            }
        }
        const [total, items] = yield Promise.all([
            groupTopic_service_1.default.countDocuments({ filter: filterOptions }),
            groupTopic_service_1.default.find({
                filter: filterOptions,
                skip: pagination.skip,
                limit: pagination.limit,
                sort,
            }),
        ]);
        return res.status(200).json({
            status: true,
            message: "Group topics found",
            data: {
                groupTopics: {
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
// GET /v1/groupTopics/:id
const findById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const groupTopicExists = yield groupTopic_service_1.default.findOne({
            filter: { _id: id },
        });
        if (!groupTopicExists) {
            return res.status(404).json({
                status: false,
                message: "Group topic id not found",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Group topic found",
            data: groupTopicExists,
        });
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// GET /v1/groupTopics/slug/:slug
const findBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const groupTopicExists = yield groupTopic_service_1.default.findOne({
            filter: { slug },
        });
        if (!groupTopicExists) {
            return res.status(404).json({
                status: false,
                message: "Group topic slug not found",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Group topic found",
            data: groupTopicExists,
        });
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
const groupTopicController = {
    find,
    findById,
    findBySlug,
};
exports.default = groupTopicController;
