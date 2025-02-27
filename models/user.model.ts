import mongoose from "mongoose";

import { EUserOnline, EUserStatus } from "../enums/user.enum";

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(EUserStatus),
    required: true
  },
  coverPhoto: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  friends: {
    type: [{
      userId: String,
      roomChatId: String
    }],
    required: true
  },
  acceptFriends: {
    type: Array,
    required: true
  },
  requestFriends: {
    type: Array,
    required: true
  },
  online: {
    type: String,
    enum: Object.values(EUserOnline),
    required: true
  },
  deleted: {
    type: Boolean,
    required: true
  }
}, {
  timestamps: true
});

const UserModel = mongoose.model("UserModel", UserSchema, "users");
export default UserModel;