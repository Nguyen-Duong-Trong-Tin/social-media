import { Request } from "express";
import { SortOrder } from "mongoose";

import paginationHelper from "../../helpers/pagination.helper";
import sortHelper from "../../helpers/sort.helper";

import IGroupTopic from "../../interfaces/groupTopic.interface";

import GroupTopicModel from "../../models/groupTopic.model";

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

  const sort: { [key: string]: SortOrder } = sortHelper(req);

  const groupTopics = await GroupTopicModel
    .find(find)
    .select("-password")
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit);;
  return groupTopics;
}

const findById = async (id: string) => {
  const groupTopicExists = await GroupTopicModel.findOne({
    _id: id,
    deleted: false
  });
  return groupTopicExists;
}

const findBySlug = async (slug: string) => {
  const groupTopicExists = await GroupTopicModel.findOne({
    slug,
    deleted: false
  });
  return groupTopicExists;
}

const calculateMaxPage = async (limit: number) => {
  const quantity: number = await GroupTopicModel.countDocuments({ deleted: false });
  return Math.ceil(quantity / limit);
}

const create = async (groupTopic: Partial<IGroupTopic>) => {
  const newGroupTopic = new GroupTopicModel(groupTopic);
  await newGroupTopic.save();
  return newGroupTopic;
}

const update = async (id: string, groupTopic: Partial<IGroupTopic>) => {
  const newGroupTopic = await GroupTopicModel.findOneAndUpdate({
    _id: id,
    deleted: false
  }, groupTopic, {
    new: true,
    runValidators: true
  });
  return newGroupTopic;
}

const del = async (id: string) => {
  const newGroupTopic = await GroupTopicModel.findOneAndUpdate({
    _id: id,
    deleted: false
  }, {
    deleted: true
  }, {
    new: true,
    runValidators: true
  });
  return newGroupTopic
}

const groupTopicService = {
  find,
  findById,
  findBySlug,
  calculateMaxPage,
  create,
  update,
  del
};
export default groupTopicService;