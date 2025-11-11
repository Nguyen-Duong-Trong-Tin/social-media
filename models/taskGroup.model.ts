import mongoose from "mongoose";

import { ETaskGroupStatus } from "../enums/taskGroup.enum";

const TaskGroupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
      required: true,
    },
    videos: {
      type: Array,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ETaskGroupStatus),
      required: true,
    },
    groupId: {
      type: String,
      required: true,
    },
    createdBy: {
      type: {
        userId: String,
        createdAt: Date,
      },
      required: true,
    },
    deleted: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TaskGroupModel = mongoose.model(
  "TaskGroupModel",
  TaskGroupSchema,
  "taskGroups"
);
export default TaskGroupModel;
