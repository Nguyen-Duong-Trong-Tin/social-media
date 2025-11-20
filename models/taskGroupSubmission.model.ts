import mongoose from "mongoose";

import { ETaskGroupSubmissionStatus } from "../enums/taskGroupSubmission.enum";

const TaskGroupSubmissionSchema = new mongoose.Schema(
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
      default: "",
    },
    images: {
      type: Array,
      required: true,
    },
    videos: {
      type: Array,
      required: true,
    },
    materials: {
      type: Array,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ETaskGroupSubmissionStatus),
      required: true,
    },
    taskGroupId: {
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

const TaskGroupSubmissionModel = mongoose.model(
  "TaskGroupSubmissionModel",
  TaskGroupSubmissionSchema,
  "taskGroupSubmissions"
);
export default TaskGroupSubmissionModel;
