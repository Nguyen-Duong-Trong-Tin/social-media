import { Request } from "express";

import { SortOrder } from "mongoose";

import paginationHelper from "../../helpers/pagination.helper";
import filterHelper from "../../helpers/filter.helper";
import sortHelper from "../../helpers/sort.helper";

import IArticleUser from "../../interfaces/articleUser.interface";

import ArticleUserModel from "../../models/articleUser.model";

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

  const filter: { [key: string]: any } = filterHelper(req);

  const sort: { [key: string]: SortOrder } = sortHelper(req);

  const articleUsers = await ArticleUserModel
    .find({
      ...find,
      ...filter
    })
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit);
  return articleUsers;
}

const findById = async (id: string) => {
  const articleUserExists = await ArticleUserModel.findOne({
    _id: id,
    deleted: false
  });
  return articleUserExists;
}


const findBySlug = async (slug: string) => {
  const articleUserExists = await ArticleUserModel.findOne({
    slug,
    deleted: false
  });
  return articleUserExists;
}

const calculateMaxPage = async (limit: number) => {
  const quantity: number = await ArticleUserModel.countDocuments({ deleted: false });
  return Math.ceil(quantity / limit);
}

const create = async (articleUser: Partial<IArticleUser>) => {
  const newArticleUser = new ArticleUserModel(articleUser);
  await newArticleUser.save();
  return newArticleUser;
}

const update = async (id: string, articleUser: Partial<IArticleUser>) => {
  const newArticleUser = await ArticleUserModel.findByIdAndUpdate({
    _id: id,
    deleted: false
  }, articleUser, {
    new: true,
    runValidators: true
  });
  return newArticleUser;
}

const del = async (id: string) => {
  const newArticleUser = await ArticleUserModel.findOneAndUpdate({
    _id: id,
    deleted: false
  }, {
    deleted: true
  }, {
    new: true,
    runValidators: true
  });
  return newArticleUser;
}

const articleUserService = {
  find,
  findById,
  findBySlug,
  calculateMaxPage,
  create,
  update,
  del
};
export default articleUserService;