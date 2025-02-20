import mongoose from "mongoose";
import { EAccountStatus } from "../enums/account.enum";

const AccountSchema = new mongoose.Schema({
  fullName: {
    type: String,
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
    enum: Object.values(EAccountStatus),
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

const AccountModel = mongoose.model("AccountModel", AccountSchema, "accounts");
export default AccountModel;