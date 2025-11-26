import { RootFilterQuery } from "mongoose";

import RoomChatModel from "../../models/roomChat.model";
import IRoomChat from "../../interfaces/roomChat.interface";

const create = async ({ doc }: { doc: Partial<IRoomChat>}) => {
  const newRoomChat = new RoomChatModel(doc);
  await newRoomChat.save();
  return newRoomChat;
};

const findOne = async ({
  filter,
}: {
  filter: RootFilterQuery<typeof RoomChatModel>;
}) => {
  return await RoomChatModel.findOne({ deleted: false, ...filter });
};

const roomChatService = {
  create,
  findOne,
};
export default roomChatService;
