import { RootFilterQuery, SortOrder } from "mongoose";

import TaskGroupModel from "../../models/taskGroup.model";
import ITaskGroup from "../../interfaces/taskGroup.interface";

const countDocuments = async ({
  filter,
}: {
  filter: RootFilterQuery<typeof TaskGroupModel>;
}) => {
  return await TaskGroupModel.countDocuments({ deleted: false, ...filter });
};

const find = async ({
  filter,
  select,
  sort,
  skip,
  limit,
}: {
  filter: RootFilterQuery<typeof TaskGroupModel>;
  select?: string;
  sort?: { [key: string]: SortOrder };
  skip?: number;
  limit?: number;
}) => {
  return await TaskGroupModel.find({ deleted: false, ...filter })
    .select(select || "")
    .sort(sort)
    .skip(skip || 0)
    .limit(limit || 20);
};

const findOne = async ({
  filter,
}: {
  filter: RootFilterQuery<typeof TaskGroupModel>;
}) => {
  return await TaskGroupModel.findOne({ deleted: false, ...filter });
};

const create = async ({ doc }: { doc: Partial<ITaskGroup> }) => {
  const newtaskGroup = new TaskGroupModel(doc);
  await newtaskGroup.save();
  return newtaskGroup;
};

const taskGroupService = {
  countDocuments,
  find,
  findOne,
  create
};
export default taskGroupService;
