import mongoose from "mongoose";

import { ERoomChatRole, ERoomChatStatus, ERoomChatType } from "../enums/roomChat.enum";

const RoomChatSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(ERoomChatType),
    required: true
  },
  avatar: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(ERoomChatStatus),
    required: true
  },
  users: {
    type: [{
      userId: {
        type: String,
        default: "",
      },
      role: {
        type: String,
        enum: Object.values(ERoomChatRole),
        required: true
      }
    }],
    required: true
  },
  userRequests: {
    type: Array,
    required: true
  },
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const RoomChatModel = mongoose.model("RoomChatModel", RoomChatSchema, "roomChats");
export default RoomChatModel;