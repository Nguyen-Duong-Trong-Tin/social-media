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
    required: true
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

const MessageChatModel = mongoose.model("MessageChatModel", MessageSchema, "messages");
export default MessageChatModel;