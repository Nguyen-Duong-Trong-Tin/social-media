import { Express } from "express";

import authRoutes from "./auth.route";
import userRoutes from "./user.route";
import groupTopicRoutes from "./groupTopic.route";
import groupRoutes from "./group.route";

const clientRoutes = (app: Express): void => {
  app.use(`/v1/auth`, authRoutes);
  app.use(`/v1/users`, userRoutes);
  app.use(`/v1/groupTopics`, groupTopicRoutes);
  app.use(`/v1/groups`, groupRoutes);
};

export default clientRoutes;
