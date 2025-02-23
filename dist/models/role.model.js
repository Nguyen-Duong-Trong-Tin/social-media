"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const RoleSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    permissions: {
        type: [String],
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
const RoleModel = mongoose_1.default.model("RoleModel", RoleSchema, "roles");
exports.default = RoleModel;
