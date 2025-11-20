import { RootFilterQuery, SortOrder, UpdateQuery } from "mongoose";

import GroupModel from "../../models/group.model";
import IGroup from "../../interfaces/group.interface";

const create = async ({ doc }: { doc: Partial<IGroup>}) => {
  const newGroup = new GroupModel(doc);
  await newGroup.save();
  return newGroup;
};

const countDocuments = async ({
  filter,
}: {
  filter: RootFilterQuery<typeof GroupModel>;
}) => {
  return await GroupModel.countDocuments({ deleted: false, ...filter });
};

const find = async ({
  filter,
  select,
  sort,
  skip,
  limit,
}: {
  filter: RootFilterQuery<typeof GroupModel>;
  select?: string;
  sort?: { [key: string]: SortOrder };
  skip?: number;
  limit?: number;
}) => {
  return await GroupModel.find({ deleted: false, ...filter })
    .select(select || "")
    .sort(sort)
    .skip(skip || 0)
    .limit(limit || 20);
};

const findOne = async ({
  filter,
}: {
  filter: RootFilterQuery<typeof GroupModel>;
}) => {
  return await GroupModel.findOne({ deleted: false, ...filter });
};

const findOneAndUpdate = async ({
  filter,
  update,
  select,
}: {
  filter: RootFilterQuery<IGroup>;
  update: UpdateQuery<IGroup>;
  select?: string;
}) => {
  const groupExists = await GroupModel.findOneAndUpdate(
    { ...filter, deleted: false },
    update,
    { new: true, runValidators: true }
  ).select(select || "");

  return groupExists;
};

const groupService = {
  create,
  countDocuments,
  find,
  findOne,
  findOneAndUpdate,
};
export default groupService;
