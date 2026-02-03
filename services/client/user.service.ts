import { RootFilterQuery, SortOrder, UpdateQuery } from "mongoose";

import UserModel from "../../models/user.model";
import IUser from "../../interfaces/user.interface";

const create = async ({ doc }: { doc: Partial<IUser> }) => {
  const newUser = new UserModel(doc);
  return await newUser.save();
};

const updateOne = async ({
  filter,
  update,
}: {
  filter: RootFilterQuery<IUser>;
  update: UpdateQuery<IUser>;
}) => {
  return await UserModel.updateOne({ ...filter, deleted: false }, update);
};

const countDocuments = async ({
  filter,
}: {
  filter: RootFilterQuery<typeof UserModel>;
}) => {
  return await UserModel.countDocuments({ deleted: false, ...filter });
};

const find = async ({
  filter,
  select,
  sort,
  skip,
  limit,
}: {
  filter: RootFilterQuery<typeof UserModel>;
  select?: string;
  sort?: { [key: string]: SortOrder };
  skip?: number;
  limit?: number;
}) => {
  return await UserModel.find({ deleted: false, ...filter })
    .select(select || "")
    .sort(sort)
    .skip(skip || 0)
    .limit(limit || 20);
};

const findOne = async ({
  filter,
  select,
}: {
  filter: RootFilterQuery<IUser>;
  select?: string;
}) => {
  const userExists = await UserModel.findOne({
    ...filter,
    deleted: false,
  }).select(select || "");
  return userExists;
};

const findOneAndUpdate = async ({
  filter,
  update,
  select,
}: {
  filter: RootFilterQuery<IUser>;
  update: UpdateQuery<IUser>;
  select?: string;
}) => {
  const userExists = await UserModel.findOneAndUpdate(
    { ...filter, deleted: false },
    update,
    { new: true, runValidators: true }
  ).select(select || "");

  return userExists;
};

const userService = {
  create,
  updateOne,
  countDocuments,
  find,
  findOne,
  findOneAndUpdate,
};
export default userService;
