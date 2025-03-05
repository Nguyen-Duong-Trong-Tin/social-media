"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_config_1 = __importDefault(require("../../configs/index.config"));
const admin_middleware_1 = __importDefault(require("../../middlewares/admin/admin.middleware"));
const deserialize_middleware_1 = __importDefault(require("../../middlewares/admin/deserialize.middleware"));
const auth_route_1 = __importDefault(require("./auth.route"));
const dashboard_route_1 = __importDefault(require("./dashboard.route"));
const role_route_1 = __importDefault(require("./role.route"));
const account_route_1 = __importDefault(require("./account.route"));
const permission_route_1 = __importDefault(require("./permission.route"));
const user_route_1 = __importDefault(require("./user.route"));
const roomChat_route_1 = __importDefault(require("./roomChat.route"));
const adminRoutes = (app) => {
    const prefixAdmin = `/${index_config_1.default.admin}`;
    app.use(admin_middleware_1.default.variable);
    app.get(`${prefixAdmin}`, admin_middleware_1.default.redirect);
    app.use(`${prefixAdmin}/auth`, auth_route_1.default);
    app.use(`${prefixAdmin}/dashboard`, deserialize_middleware_1.default, dashboard_route_1.default);
    app.use(`${prefixAdmin}/roles`, deserialize_middleware_1.default, role_route_1.default);
    app.use(`${prefixAdmin}/accounts`, deserialize_middleware_1.default, account_route_1.default);
    app.use(`${prefixAdmin}/permissions`, deserialize_middleware_1.default, permission_route_1.default);
    app.use(`${prefixAdmin}/users`, deserialize_middleware_1.default, user_route_1.default);
    app.use(`${prefixAdmin}/roomChats`, deserialize_middleware_1.default, roomChat_route_1.default);
};
exports.default = adminRoutes;
