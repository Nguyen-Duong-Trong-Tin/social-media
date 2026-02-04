import { Express } from "express";

import authRoutes from "./auth.route";
import userRoutes from "./user.route";
import groupTopicRoutes from "./groupTopic.route";
import groupRoutes from "./group.route";
import articleUserRoutes from "./articleUser.route";
import articleGroupRoutes from "./articleGroup.route";
import taskGroupRoute from "./taskGroup.route";
import taskGroupSubmission from "./taskGroupSubmission.route";
import roomChatRoutes from './roomChat.route';
import messageRoutes from "./message.route";

const clientRoutes = (app: Express): void => {
  app.use(`/v1/auth`, authRoutes);
  app.use(`/v1/users`, userRoutes);
  app.use(`/v1/groupTopics`, groupTopicRoutes);
  app.use(`/v1/groups`, groupRoutes);
  app.use(`/v1/articleUsers`, articleUserRoutes);
  app.use(`/v1/articleGroups`, articleGroupRoutes);
  app.use(`/v1/taskGroups`, taskGroupRoute);
  app.use(`/v1/taskGroupSubmissions`, taskGroupSubmission);
  app.use(`/v1/roomChats`, roomChatRoutes);
  app.use(`/v1/messages`, messageRoutes);
};

export default clientRoutes;
