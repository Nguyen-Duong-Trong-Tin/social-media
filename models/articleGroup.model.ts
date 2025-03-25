import mongoose from "mongoose";

import { EArticleGroupStatus } from "../enums/articleGroup.enum";

const ArticleGroupSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: {
    type: Array,
    required: true
  },
  videos: {
    type: Array,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(EArticleGroupStatus),
    required: true
  },
  groupId: {
    type: String,
    required: true
  },
  createdBy: {
    type: {
      userId: String,
      createdAt: Date
    },
    required: true
  },
  deleted: {
    type: Boolean,
    required: true
  }
}, {
  timestamps: true
});

const ArticleGroupModel = mongoose.model("ArticleGroupModel", ArticleGroupSchema, "articleGroups");
export default ArticleGroupModel;