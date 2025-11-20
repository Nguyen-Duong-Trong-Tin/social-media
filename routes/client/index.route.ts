import { Express } from "express";

import authRoutes from "./auth.route";
import userRoutes from "./user.route";
import groupTopicRoutes from "./groupTopic.route";
import groupRoutes from "./group.route";
import taskGroupRoute from "./taskGroup.route";
import taskGroupSubmission from "./taskGroupSubmission.route";

const clientRoutes = (app: Express): void => {
  app.use(`/v1/auth`, authRoutes);
  app.use(`/v1/users`, userRoutes);
  app.use(`/v1/groupTopics`, groupTopicRoutes);
  app.use(`/v1/groups`, groupRoutes);
  app.use(`/v1/taskGroups`, taskGroupRoute);
  app.use(`/v1/taskGroupSubmissions`, taskGroupSubmission);
};

export default clientRoutes;
