import mongoose from "mongoose";

import { EUserOnline, EUserStatus } from "../enums/user.enum";

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "https://aic.com.vn/wp-content/uploads/2024/10/avatar-fb-mac-dinh-2.jpg",
    },
    status: {
      type: String,
      enum: Object.values(EUserStatus),
      required: true,
    },
    coverPhoto: {
      type: String,
      default: "https://cellphones.com.vn/sforum/wp-content/uploads/2024/04/anh-bia-facebook-3.jpg",
    },
    bio: {
      type: String,
      default: "",
    },
    friends: {
      type: [
        {
          userId: String,
          roomChatId: String,
        },
      ],
      required: true,
    },
    friendAccepts: {
      type: Array,
      required: true,
    },
    friendRequests: {
      type: Array,
      required: true,
    },
    online: {
      type: String,
      enum: Object.values(EUserOnline),
      required: true,
    },
    deleted: {
      type: Boolean,
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("UserModel", UserSchema, "users");
export default UserModel;
