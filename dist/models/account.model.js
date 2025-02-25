"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const account_enum_1 = require("../enums/account.enum");
const AccountSchema = new mongoose_1.default.Schema({
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
        required: true
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
        enum: Object.values(account_enum_1.EAccountStatus),
        required: true
    },
    roleId: {
        type: String,
        required: true
    },
    createdBy: {
        type: {
            accountId: String,
            createdAt: Date
        },
        required: true
    },
    updatedBy: {
        type: [{
                accountId: String,
                updatedAt: Date
            }]
    },
    deleted: {
        type: Boolean,
        required: true
    },
    deletedBy: {
        type: {
            accountId: String,
            deletedAt: Date
        }
    }
}, {
    timestamps: true
});
const AccountModel = mongoose_1.default.model("AccountModel", AccountSchema, "accounts");
exports.default = AccountModel;
