import { Express } from "express";

import configs from "../../configs/index.config";

import adminMiddleware from "../../middlewares/admin/admin.middleware";
import deserialize from "../../middlewares/admin/deserialize.middleware";

import authRoutes from "./auth.route";
import dashboardRoutes from "./dashboard.route";
import roleRoutes from "./role.route";
import accountRoutes from "./account.route";
import permissionRoutes from "./permission.route";
import userRoutes from "./user.route";
import roomChatRoutes from "./roomChat.route";

const adminRoutes = (app: Express): void => {
  const prefixAdmin: string = `/${configs.admin}`;

  app.use(adminMiddleware.variable);
  app.get(`${prefixAdmin}`, adminMiddleware.redirect);

  app.use(`${prefixAdmin}/auth`, authRoutes);
  app.use(
    `${prefixAdmin}/dashboard`,
    deserialize, 
    dashboardRoutes
  );
  app.use(
    `${prefixAdmin}/roles`,
    deserialize,
    roleRoutes
  );
  app.use(
    `${prefixAdmin}/accounts`,
    deserialize,
    accountRoutes
  );
  app.use(
    `${prefixAdmin}/permissions`,
    deserialize,
    permissionRoutes
  );
  app.use(
    `${prefixAdmin}/users`,
    deserialize,
    userRoutes
  );
  app.use(
    `${prefixAdmin}/roomChats`,
    deserialize,
    roomChatRoutes
  );
}

export default adminRoutes;