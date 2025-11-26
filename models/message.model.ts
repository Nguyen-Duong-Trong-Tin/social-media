import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  content: {
    type: String,
    default: "",
  },
  images: {
    type: [String],
    default: [],
  },
  videos: {
    type: [String],
    default: [],
  },
  materials: {
    type: [String],
    default: []
  },
  userId: {
    type: String,
    default: "",
  },
  roomChatId: {
    type: String,
    required: true
  },
  deleted: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true
});

const MessageModel = mongoose.model("MessageModel", MessageSchema, "messages");
export default MessageModel;