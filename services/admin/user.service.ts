import { Request } from "express";
import { SortOrder } from "mongoose";

import { EUserStatus } from "../../enums/user.enum";

import filterHelper from "../../helpers/filter.helper";
import paginationHelper from "../../helpers/pagination.helper";
import sortHelper from "../../helpers/sort.helper";

import IUser from "../../interfaces/user.interface";

import UserModel from "../../models/user.model";

import slugUtil from "../../utils/slug.util";

const findAll = async () => {
  const users = await UserModel
    .find({
      status: EUserStatus.active,
      deleted: false
    })
    .select("-password");
  return users;
}

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

  const users = await UserModel
    .find({
      ...find,
      ...filter
    })
    .select("-password")
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit);;
  return users;
}

const findById = async (id: string) => {
  const userExists = await UserModel
    .findOne({
      _id: id,
      deleted: false
    })
    .select("-password");
  return userExists;
}

const findBySlug = async (slug: string) => {
  const userExists = await UserModel
    .findOne({
      slug,
      deleted: false
    })
    .select("-password");
  return userExists;
}

const findByEmail = async (email: string) => {
  const userExists = await UserModel
    .findOne({
      email,
      deleted: false
    })
    .select("-password");
  return userExists;
}

const findByPhone = async (phone: string) => {
  const userExists = await UserModel
    .findOne({
      phone,
      deleted: false
    })
    .select("-password");
  return userExists;
}

const calculateMaxPage = async (limit: number) => {
  const quantity: number = await UserModel.countDocuments({ deleted: false });
  return Math.ceil(quantity / limit);
}

const create = async (user: Partial<IUser>) => {
  const newUser = new UserModel(user);
  await newUser.save();

  const userExists = await UserModel
    .findOne({ _id: newUser.id })
    .select("-password");
  return userExists;
}

const update = async (id: string, user: Partial<IUser>) => {
  const newUser = await UserModel
    .findOneAndUpdate({
      _id: id,
      deleted: false
    }, user, {
      new: true,
      runValidators: true
    })
    .select("-password");
  return newUser;
}

const del = async (id: string) => {
  const newUser = await UserModel
    .findOneAndUpdate({
      _id: id,
      deleted: false
    }, {
      deleted: true
    }, {
      new: true,
      runValidators: true
    })
    .select("-password");
  return newUser;
}

const userService = {
  findAll,
  find,
  findById,
  findBySlug,
  findByEmail,
  findByPhone,
  calculateMaxPage,
  create,
  update,
  del
};
export default userService;