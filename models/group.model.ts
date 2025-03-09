import mongoose from "mongoose";

import { EGroupRole, EGroupStatus } from "../enums/group.enum";

const GroupSchema = new mongoose.Schema({
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
  avatar: {
    type: String,
    required: true
  },
  coverPhoto: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(EGroupStatus),
    required: true
  },
  users: {
    type: [{
      userId: String,
      role: {
        type: String,
        enum: Object.values(EGroupRole),
        required: true
      }
    }],
    required: true
  },
  userRequests: {
    type: Array,
    required: true
  },
  groupTopicId: {
    type: String,
    required: true
  },
  deleted: {
    type: Boolean,
    required: true
  }
}, {
  timestamps: true
});

const GroupModel = mongoose.model("GroupModel", GroupSchema, "groups");
export default GroupModel;