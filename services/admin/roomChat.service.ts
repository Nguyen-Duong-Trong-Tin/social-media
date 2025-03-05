import { Request } from "express";
import { SortOrder } from "mongoose";

import { ERoomChatRole } from "../../enums/roomChat.enum";

import paginationHelper from "../../helpers/pagination.helper";
import filterHelper from "../../helpers/filter.helper";
import sortHelper from "../../helpers/sort.helper";

import IRoomChat from "../../interfaces/roomChat.interface";

import RoomChatModel from "../../models/roomChat.model";

import slugUtil from "../../utils/slug.util";

const find = async (req: Request) => {
  const pagination: {
    limit: number;
    skip: number;
  } = paginationHelper(req);

  const find: {
    deleted: boolean,
    slug?: RegExp
  } = { deleted: false };

  if (req.query.keyword) {
    const slug: string = slugUtil.convert(req.query.keyword as string);
    find.slug = new RegExp(slug, "i");
  }

  const filter: { [key: string]: any } = filterHelper(req);

  const sort: { [key: string]: SortOrder } = sortHelper(req);

  const roomChats = await RoomChatModel
    .find({
      ...find,
      ...filter
    })
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit);
  return roomChats;
}

const findById = async (id: string) => {
  const roomChatExists = await RoomChatModel.findOne({
    _id: id,
    deleted: false
  });
  return roomChatExists;
}

const findBySlug = async (slug: string) => {
  const roomChatExists = await RoomChatModel.findOne({
    slug,
    deleted: false
  });
  return roomChatExists;
}

const findUserInRoomChat = async (id: string, userId: string) => {
  const roomChatUserExists = await RoomChatModel.findOne({
    _id: id,
    "users.userId": userId,
    deleted: false
  });
  return roomChatUserExists;
}

const calculateMaxPage = async (limit: number) => {
  const quantity: number = await RoomChatModel.countDocuments({ deleted: false });
  return Math.ceil(quantity / limit);
}

const create = async (roomChat: Partial<IRoomChat>) => {
  const newRoomChat = new RoomChatModel(roomChat);
  await newRoomChat.save();
  return newRoomChat;
}

const update = async (id: string, roomChat: Partial<IRoomChat>) => {
  const newRoomChat = await RoomChatModel.findOneAndUpdate({
    _id: id,
    deleted: false
  }, roomChat, {
    new: true,
    runValidators: true
  });
  return newRoomChat;
}

const changeUserRole = async (
  id: string,
  userId: string,
  role: string
) => {
  const newRoomChat = await RoomChatModel.findOneAndUpdate({
    _id: id,
    "users.userId": userId,
    deleted: false
  }, {
    $set: {
      "users.$.role": role
    }
  }, {
    new: true,
    runValidators: true
  });
  return newRoomChat;
}

const acceptUser = async (id: string, userId: string) => {
  const newRoomChat = await RoomChatModel.findOneAndUpdate(
    {
      _id: id,
      deleted: false
    },
    {
      $push: {
        users: {
          userId,
          role: ERoomChatRole.user
        }
      }
    },
    {
      new: true,
      runValidators: true
    }
  );
  return newRoomChat;
}

const delUser = async (id: string, userId: string) => {
  const newRoomChat = await RoomChatModel.findOneAndUpdate(
    {
      _id: id,
      deleted: false
    },
    { $pull: { users: { userId } } },
    {
      new: true,
      runValidators: true
    }
  );
  return newRoomChat;
}

const delUserRequest = async (id: string, userId: string) => {
  const newRoomChat = await RoomChatModel.findOneAndUpdate(
    {
      _id: id,
      deleted: false
    },
    { $pull: { userRequests: userId } },
    {
      new: true,
      runValidators: true
    }
  );
  return newRoomChat;
}

const del = async (id: string) => {
  const newRoomChat = await RoomChatModel.findOneAndUpdate({
    _id: id,
    deleted: false
  }, {
    deleted: true
  }, {
    new: true,
    runValidators: true
  });
  return newRoomChat;
}

const roomChatService = {
  find,
  findById,
  findBySlug,
  findUserInRoomChat,
  calculateMaxPage,
  create,
  update,
  changeUserRole,
  acceptUser,
  delUser,
  delUserRequest,
  del
};
export default roomChatService;