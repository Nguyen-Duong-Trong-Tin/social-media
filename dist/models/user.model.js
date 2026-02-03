"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const user_enum_1 = require("../enums/user.enum");
const UserSchema = new mongoose_1.default.Schema({
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
        default: "https://scontent.fvca1-1.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=dst-png_s200x200&_nc_cat=1&ccb=1-7&_nc_sid=136b72&_nc_ohc=72JKYE4Co3AQ7kNvwGGN3Vi&_nc_oc=Adm95NUudPLGhpnyETRVlrr8tRKhd55nSSWxOyzNGTzAB25k1eUjHc8Tnq97Q39HT3A&_nc_zt=24&_nc_ht=scontent.fvca1-1.fna&oh=00_Afq-ToSPvj1Xu8du51D5fR-mhjB8337x_JAECxTMHiW4Ww&oe=699D9F7A",
    },
    status: {
        type: String,
        enum: Object.values(user_enum_1.EUserStatus),
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
        enum: Object.values(user_enum_1.EUserOnline),
        required: true,
    },
    deleted: {
        type: Boolean,
        required: true,
    },
    refreshToken: {
        type: String,
    },
}, {
    timestamps: true,
});
const UserModel = mongoose_1.default.model("UserModel", UserSchema, "users");
exports.default = UserModel;
