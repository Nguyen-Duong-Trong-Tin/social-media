import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  permission: {
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

const RoleModel = mongoose.model("RoleModel", RoleSchema, "roles");
export default RoleModel;