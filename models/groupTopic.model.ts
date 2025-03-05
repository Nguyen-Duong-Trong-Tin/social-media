import mongoose from "mongoose";

const GroupTopicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  deleted: {
    type: Boolean,
    required: true
  }
}, {
  timestamps: true
});

const GroupTopicModel = mongoose.model("GroupTopicModel", GroupTopicSchema, "groupTopics");
export default GroupTopicModel;