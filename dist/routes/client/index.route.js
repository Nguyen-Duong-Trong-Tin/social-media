"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_route_1 = __importDefault(require("./auth.route"));
const user_route_1 = __importDefault(require("./user.route"));
const groupTopic_route_1 = __importDefault(require("./groupTopic.route"));
const group_route_1 = __importDefault(require("./group.route"));
const taskGroup_route_1 = __importDefault(require("./taskGroup.route"));
const taskGroupSubmission_route_1 = __importDefault(require("./taskGroupSubmission.route"));
const clientRoutes = (app) => {
    app.use(`/v1/auth`, auth_route_1.default);
    app.use(`/v1/users`, user_route_1.default);
    app.use(`/v1/groupTopics`, groupTopic_route_1.default);
    app.use(`/v1/groups`, group_route_1.default);
    app.use(`/v1/taskGroups`, taskGroup_route_1.default);
    app.use(`/v1/taskGroupSubmissions`, taskGroupSubmission_route_1.default);
};
exports.default = clientRoutes;
