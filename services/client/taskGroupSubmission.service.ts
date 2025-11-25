import {
  QueryOptions,
  RootFilterQuery,
  SortOrder,
  UpdateQuery,
} from "mongoose";

import TaskGroupSubmissionModel from "../../models/taskGroupSubmission.model";
import ITaskGroupSubmission from "../../interfaces/taskGroupSubmission.interface";

const countDocuments = async ({
  filter,
}: {
  filter: RootFilterQuery<typeof TaskGroupSubmissionModel>;
}) => {
  return await TaskGroupSubmissionModel.countDocuments({
    deleted: false,
    ...filter,
  });
};

const find = async ({
  filter,
  select,
  sort,
  skip,
  limit,
}: {
  filter: RootFilterQuery<typeof TaskGroupSubmissionModel>;
  select?: string;
  sort?: { [key: string]: SortOrder };
  skip?: number;
  limit?: number;
}) => {
  return await TaskGroupSubmissionModel.find({ deleted: false, ...filter })
    .select(select || "")
    .sort(sort)
    .skip(skip || 0)
    .limit(limit || 20);
};

const findOne = async ({
  filter,
}: {
  filter: RootFilterQuery<typeof TaskGroupSubmissionModel>;
}) => {
  return await TaskGroupSubmissionModel.findOne({ deleted: false, ...filter });
};

const findOneAndUpdate = async ({
  filter,
  update,
  options,
}: {
  filter: RootFilterQuery<typeof TaskGroupSubmissionModel>;
  update: UpdateQuery<ITaskGroupSubmission>;
  options?: QueryOptions;
}) => {
  return await TaskGroupSubmissionModel.findOneAndUpdate(
    {
      deleted: false,
      ...filter,
    },
    update,
    {
      new: true,
      runValidators: true,
      ...options,
    }
  );
};

const create = async ({ doc }: { doc: ITaskGroupSubmission }) => {
  const newTaskGroupSubmission = new TaskGroupSubmissionModel(doc);
  await newTaskGroupSubmission.save();
  return newTaskGroupSubmission;
};

const updateMany = async ({
  filter,
  update,
}: {
  filter: RootFilterQuery<typeof TaskGroupSubmissionModel>;
  update: UpdateQuery<ITaskGroupSubmission>;
}) => {
  const newTaskGroupSubmission = await TaskGroupSubmissionModel.updateMany(
    { deleted: false, ...filter },
    update
  );
  return newTaskGroupSubmission;
};

const taskGroupSubmissionService = {
  countDocuments,
  find,
  findOne,
  findOneAndUpdate,
  create,
  updateMany,
};
export default taskGroupSubmissionService;
