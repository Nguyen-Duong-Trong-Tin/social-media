import { Request } from "express";

import { SortOrder } from "mongoose";

import paginationHelper from "../../helpers/pagination.helper";
import filterHelper from "../../helpers/filter.helper";
import sortHelper from "../../helpers/sort.helper";

import ITaskGroup from "../../interfaces/taskGroup.interface";

import TaskGroupModel from "../../models/taskGroup.model";

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

  const taskGroups = await TaskGroupModel.find({
    ...find,
    ...filter,
  })
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit);
  return taskGroups;
};

const findById = async (id: string) => {
  const taskGroupExists = await TaskGroupModel.findOne({
    _id: id,
    deleted: false,
  });
  return taskGroupExists;
};

const findBySlug = async (slug: string) => {
  const taskGroupExists = await TaskGroupModel.findOne({
    slug,
    deleted: false,
  });
  return taskGroupExists;
};

const calculateMaxPage = async (limit: number) => {
  const quantity: number = await TaskGroupModel.countDocuments({
    deleted: false,
  });
  return Math.ceil(quantity / limit);
};

const create = async (taskGroup: Partial<ITaskGroup>) => {
  const newtaskGroup = new TaskGroupModel(taskGroup);
  await newtaskGroup.save();
  return newtaskGroup;
};

const update = async (id: string, taskGroup: Partial<ITaskGroup>) => {
  const newTaskGroup = await TaskGroupModel.findByIdAndUpdate(
    {
      _id: id,
      deleted: false,
    },
    taskGroup,
    {
      new: true,
      runValidators: true,
    }
  );
  return newTaskGroup;
};

const del = async (id: string) => {
  const newTaskGroup = await TaskGroupModel.findOneAndUpdate(
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
  return newTaskGroup;
};

const taskGroupService = {
  find,
  findById,
  findBySlug,
  calculateMaxPage,
  create,
  update,
  del,
};
export default taskGroupService;
