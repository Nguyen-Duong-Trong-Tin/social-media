import { RootFilterQuery, UpdateQuery } from "mongoose";

import TaskGroupSubmissionModel from "../../models/taskGroupSubmission.model";
import ITaskGroupSubmission from "../../interfaces/taskGroupSubmission.interface";

const find = async ({
  filter,
}: {
  filter: RootFilterQuery<typeof TaskGroupSubmissionModel>;
}) => {
  return await TaskGroupSubmissionModel.find({ deleted: false, ...filter });
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
}: {
  filter: RootFilterQuery<typeof TaskGroupSubmissionModel>;
  update: UpdateQuery<ITaskGroupSubmission>;
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
    }
  );
};

const create = async ({ doc }: { doc: ITaskGroupSubmission }) => {
  const newTaskGroupSubmission = new TaskGroupSubmissionModel(doc);
  await newTaskGroupSubmission.save();
  return newTaskGroupSubmission;
};

const taskGroupSubmissionService = {
  find,
  findOne,
  findOneAndUpdate,
  create,
};
export default taskGroupSubmissionService;
