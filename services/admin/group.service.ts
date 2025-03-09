import { Request } from "express";
import { SortOrder } from "mongoose";

import paginationHelper from "../../helpers/pagination.helper";
import filterHelper from "../../helpers/filter.helper";
import sortHelper from "../../helpers/sort.helper";

import IGroup from "../../interfaces/group.interface";

import GroupModel from "../../models/group.model";

import slugUtil from "../../utils/slug.util";
import { EGroupRole } from "../../enums/group.enum";

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

  const groups = await GroupModel
    .find({
      ...find,
      ...filter
    })
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit);
  return groups;
}

const findById = async (id: string) => {
  const groupExists = await GroupModel.findOne({
    _id: id,
    deleted: false
  });
  return groupExists;
}

const findBySlug = async (slug: string) => {
  const groupExists = await GroupModel.findOne({
    slug,
    deleted: false
  });
  return groupExists;
}

const findUserInGroup = async (id: string, userId: string) => {
  const groupUserExists = await GroupModel.findOne({
    _id: id,
    "users.userId": userId,
    deleted: false
  });
  return groupUserExists;
}

const calculateMaxPage = async (limit: number) => {
  const quantity: number = await GroupModel.countDocuments({ deleted: false });
  return Math.ceil(quantity / limit);
}

const create = async (group: Partial<IGroup>) => {
  const newGroup = new GroupModel(group);
  await newGroup.save();
  return newGroup;
}

const update = async (id: string, group: Partial<IGroup>) => {
  const newGroup = await GroupModel.findOneAndUpdate({
    _id: id,
    deleted: false
  }, group, {
    new: true,
    runValidators: true
  });
  return newGroup;
}

const changeUserRole = async (
  id: string,
  userId: string,
  role: string
) => {
  const newGroup = await GroupModel.findOneAndUpdate({
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
  return newGroup;
}

const acceptUser = async (id: string, userId: string) => {
  const newGroup = await GroupModel.findOneAndUpdate(
    {
      _id: id,
      deleted: false
    },
    {
      $push: {
        users: {
          userId,
          role: EGroupRole.user
        }
      }
    },
    {
      new: true,
      runValidators: true
    }
  );
  return newGroup;
}

const delUser = async (id: string, userId: string) => {
  const newGroup = await GroupModel.findOneAndUpdate(
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
  return newGroup;
}

const delUserRequest = async (id: string, userId: string) => {
  const newGroup = await GroupModel.findOneAndUpdate(
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
  return newGroup;
}

const del = async (id: string) => {
  const newGroup = await GroupModel.findOneAndUpdate({
    _id: id,
    deleted: false
  }, {
    deleted: true
  }, {
    new: true,
    runValidators: true
  });
  return newGroup;
}

const groupService = {
  find,
  findById,
  findBySlug,
  findUserInGroup,
  calculateMaxPage,
  create,
  update,
  changeUserRole,
  acceptUser,
  delUser,
  delUserRequest,
  del
};
export default groupService;