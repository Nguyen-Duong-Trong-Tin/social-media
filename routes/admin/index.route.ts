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
import groupTopicRoutes from "./groupTopic.route";
import groupRoutes from "./group.route";
import articleGroupRoutes from "./articleGroup.route";
import articleUserRoutes from "./articleUser.route";
import taskGroupRoutes from "./taskGroup.route";

const adminRoutes = (app: Express): void => {
  const prefixAdmin: string = `/${configs.admin}`;

  app.use(adminMiddleware.variable);
  app.get(`${prefixAdmin}`, adminMiddleware.redirect);

  app.use(`${prefixAdmin}/auth`, authRoutes);
  app.use(`${prefixAdmin}/dashboard`, deserialize, dashboardRoutes);
  app.use(`${prefixAdmin}/roles`, deserialize, roleRoutes);
  app.use(`${prefixAdmin}/accounts`, deserialize, accountRoutes);
  app.use(`${prefixAdmin}/permissions`, deserialize, permissionRoutes);
  app.use(`${prefixAdmin}/users`, deserialize, userRoutes);
  app.use(`${prefixAdmin}/roomChats`, deserialize, roomChatRoutes);
  app.use(`${prefixAdmin}/groupTopics`, deserialize, groupTopicRoutes);
  app.use(`${prefixAdmin}/groups`, deserialize, groupRoutes);
  app.use(`${prefixAdmin}/articleGroups`, deserialize, articleGroupRoutes);
  app.use(`${prefixAdmin}/articleUsers`, deserialize, articleUserRoutes);
  app.use(`${prefixAdmin}/taskGroups`, deserialize, taskGroupRoutes);
};

export default adminRoutes;
