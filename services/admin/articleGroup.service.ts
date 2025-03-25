import { Request } from "express";
import { SortOrder } from "mongoose";

import paginationHelper from "../../helpers/pagination.helper";
import filterHelper from "../../helpers/filter.helper";
import sortHelper from "../../helpers/sort.helper";

import ArticleGroupModel from "../../models/articleGroup.model";

import slugUtil from "../../utils/slug.util";
import IArticleGroup from "../../interfaces/articleGroup.interface";

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

  const articleGroups = await ArticleGroupModel
    .find({
      ...find,
      ...filter
    })
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit);
  return articleGroups;
}

const findById = async (id: string) => {
  const articleGroupExists = await ArticleGroupModel.findOne({
    _id: id,
    deleted: false
  });
  return articleGroupExists;
}

const findBySlug = async (slug: string) => {
  const articleGroupExists = await ArticleGroupModel.findOne({
    slug,
    deleted: false
  });
  return articleGroupExists;
}

const calculateMaxPage = async (limit: number) => {
  const quantity: number = await ArticleGroupModel.countDocuments({ deleted: false });
  return Math.ceil(quantity / limit);
}

const create = async (articleGroup: Partial<IArticleGroup>) => {
  const newArticleGroup = new ArticleGroupModel(articleGroup);
  await newArticleGroup.save();
  return newArticleGroup;
}

const update = async (id: string, articleGroup: Partial<IArticleGroup>) => {
  const newArticleGroup = await ArticleGroupModel.findByIdAndUpdate({
    _id: id,
    deleted: false
  }, articleGroup, {
    new: true,
    runValidators: true
  });
  return newArticleGroup;
}

const del = async (id: string) => {
  const newArticleGroup = await ArticleGroupModel.findOneAndUpdate({
    _id: id,
    deleted: false
  }, {
    deleted: true
  }, {
    new: true,
    runValidators: true
  });
  return newArticleGroup;
}

const articleGroupService = {
  find,
  findById,
  findBySlug,
  calculateMaxPage,
  create,
  update,
  del
};
export default articleGroupService;