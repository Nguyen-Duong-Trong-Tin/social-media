import mongoose from "mongoose";

import { EArticleUserStatus } from "../enums/articleUser.enum";

const ArticleUserSchema = new mongoose.Schema({
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
    enum: Object.values(EArticleUserStatus),
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

const ArticleUserModel = mongoose.model("ArticleUserModel", ArticleUserSchema, "articleUsers");
export default ArticleUserModel;