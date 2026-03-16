import { RootFilterQuery, UpdateQuery } from "mongoose";

import RoomChatModel from "../../models/roomChat.model";
import IRoomChat from "../../interfaces/roomChat.interface";

const create = async ({ doc }: { doc: Partial<IRoomChat> }) => {
  const newRoomChat = new RoomChatModel(doc);
  await newRoomChat.save();
  return newRoomChat;
};

const deleteOne = async ({
  filter,
}: {
  filter: RootFilterQuery<IRoomChat>;
}) => {
  return await RoomChatModel.deleteOne(filter);
};

const findOne = async ({
  filter,
}: {
  filter: RootFilterQuery<IRoomChat>;
}) => {
  return await RoomChatModel.findOne({ deleted: false, ...filter });
};

const findOneAndUpdate = async ({
  filter,
  update,
}: {
  filter: RootFilterQuery<IRoomChat>;
  update: UpdateQuery<IRoomChat>;
}) => {
  return await RoomChatModel.findOneAndUpdate(
    { deleted: false, ...filter },
    update,
    { new: true, runValidators: true }
  );
};

const find = async ({
  filter,
  sort,
  limit,
}: {
  filter: RootFilterQuery<IRoomChat>;
  sort?: Record<string, 1 | -1>;
  limit?: number;
}) => {
  return await RoomChatModel.find({ deleted: false, ...filter })
    .sort(sort || {})
    .limit(limit || 50);
};

const roomChatService = {
  create,
  deleteOne,
  findOne,
  findOneAndUpdate,
  find,
};
export default roomChatService;
