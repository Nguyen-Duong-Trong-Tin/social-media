import { Request } from "express";

import { SortOrder } from "mongoose";

import paginationHelper from "../../helpers/pagination.helper";
import filterHelper from "../../helpers/filter.helper";
import sortHelper from "../../helpers/sort.helper";

import ITaskGroupSubmission from "../../interfaces/taskGroupSubmission.interface";

import TaskGroupSubmissionModel from "../../models/taskGroupSubmission.model";

import slugUtil from "../../utils/slug.util";

const find = async (req: Request) => {
  const pagination: {
    limit: number;
    skip: number;
  } = paginationHelper(req);

  const find: {
    deleted: boolean;
    slug?: RegExp;
  } = { deleted: false };

  if (req.query.keyword) {
    const slug: string = slugUtil.convert(req.query.keyword as string);
    find.slug = new RegExp(slug, "i");
  }

  const filter: { [key: string]: any } = filterHelper(req);

  const sort: { [key: string]: SortOrder } = sortHelper(req);

  const taskGroupSubmissions = await TaskGroupSubmissionModel.find({
    ...find,
    ...filter,
  })
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit);
  return taskGroupSubmissions;
};

const findById = async (id: string) => {
  const taskGroupSubmissionExists = await TaskGroupSubmissionModel.findOne({
    _id: id,
    deleted: false,
  });
  return taskGroupSubmissionExists;
};

const findBySlug = async (slug: string) => {
  const taskGroupSubmissionExists = await TaskGroupSubmissionModel.findOne({
    slug,
    deleted: false,
  });
  return taskGroupSubmissionExists;
};

const calculateMaxPage = async (limit: number) => {
  const quantity: number = await TaskGroupSubmissionModel.countDocuments({
    deleted: false,
  });
  return Math.ceil(quantity / limit);
};

const create = async (taskGroupSubmissionn: Partial<ITaskGroupSubmission>) => {
  const newtaskGroupSubmission = new TaskGroupSubmissionModel(taskGroupSubmissionn);
  await newtaskGroupSubmission.save();
  return newtaskGroupSubmission;
};

const update = async (id: string, taskGroupSubmission: Partial<ITaskGroupSubmission>) => {
  const newTaskGroupSubmission = await TaskGroupSubmissionModel.findByIdAndUpdate(
    {
      _id: id,
      deleted: false,
    },
    taskGroupSubmission,
    {
      new: true,
      runValidators: true,
    }
  );
  return newTaskGroupSubmission;
};

const del = async (id: string) => {
  const newTaskGroupSubmission = await TaskGroupSubmissionModel.findOneAndUpdate(
    {
      _id: id,
      deleted: false,
    },
    {
      deleted: true,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  return newTaskGroupSubmission;
};

const taskGroupSubmissionService = {
  find,
  findById,
  findBySlug,
  calculateMaxPage,
  create,
  update,
  del
};
export default taskGroupSubmissionService;