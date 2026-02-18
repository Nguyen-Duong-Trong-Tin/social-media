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
const user_model_1 = __importDefault(require("../../models/user.model"));
const group_model_1 = __importDefault(require("../../models/group.model"));
const articleUser_model_1 = __importDefault(require("../../models/articleUser.model"));
const articleGroup_model_1 = __importDefault(require("../../models/articleGroup.model"));
const roomChat_model_1 = __importDefault(require("../../models/roomChat.model"));
const taskGroup_model_1 = __importDefault(require("../../models/taskGroup.model"));
const taskGroupSubmission_model_1 = __importDefault(require("../../models/taskGroupSubmission.model"));
// [GET] /admin/dashboard
const get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [users, groups, articleUsers, articleGroups, roomChats, taskGroups, taskGroupSubmissions,] = yield Promise.all([
            user_model_1.default.countDocuments({ deleted: false }),
            group_model_1.default.countDocuments({ deleted: false }),
            articleUser_model_1.default.countDocuments({ deleted: false }),
            articleGroup_model_1.default.countDocuments({ deleted: false }),
            roomChat_model_1.default.countDocuments({ deleted: false }),
            taskGroup_model_1.default.countDocuments({ deleted: false }),
            taskGroupSubmission_model_1.default.countDocuments({ deleted: false }),
        ]);
        const stats = {
            users,
            groups,
            articleUsers,
            articleGroups,
            roomChats,
            taskGroups,
            taskGroupSubmissions,
        };
        console.log(stats);
        return res.render("admin/pages/dashboard", {
            pageTitle: "Dashboard",
            stats: {
                users,
                groups,
                articleUsers,
                articleGroups,
                roomChats,
                taskGroups,
                taskGroupSubmissions,
            },
        });
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
        return res.redirect("back");
    }
});
const dashboardController = {
    get,
};
exports.default = dashboardController;
