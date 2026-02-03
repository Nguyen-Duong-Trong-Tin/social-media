import { RootFilterQuery, SortOrder, UpdateQuery } from "mongoose";

import ArticleUserModel from "../../models/articleUser.model";
import IArticleUser from "../../interfaces/articleUser.interface";

const countDocuments = async ({
  filter,
}: {
  filter: RootFilterQuery<typeof ArticleUserModel>;
}) => {
  return await ArticleUserModel.countDocuments({ deleted: false, ...filter });
};

const find = async ({
  filter,
  select,
  sort,
  skip,
  limit,
}: {
  filter: RootFilterQuery<typeof ArticleUserModel>;
  select?: string;
  sort?: { [key: string]: SortOrder };
  skip?: number;
  limit?: number;
}) => {
  return await ArticleUserModel.find({ deleted: false, ...filter })
    .select(select || "")
    .sort(sort)
    .skip(skip || 0)
    .limit(limit || 20);
};

const findOne = async ({
  filter,
}: {
  filter: RootFilterQuery<typeof ArticleUserModel>;
}) => {
  return await ArticleUserModel.findOne({ deleted: false, ...filter });
};

const findOneAndUpdate = ({
  filter,
  update,
}: {
  filter: RootFilterQuery<typeof ArticleUserModel>;
  update: UpdateQuery<IArticleUser>;
}) => {
  return ArticleUserModel.findOneAndUpdate(
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

const create = async ({ doc }: { doc: Partial<IArticleUser> }) => {
  const newArticleUser = new ArticleUserModel(doc);
  await newArticleUser.save();
  return newArticleUser;
};

const del = async ({ id }: { id: string }) => {
  return ArticleUserModel.findOneAndUpdate(
    {
      _id: id,
      deleted: false,
    },
    { deleted: true },
    {
      new: true,
      runValidators: true,
    }
  );
};

const articleUserService = {
  countDocuments,
  find,
  findOne,
  findOneAndUpdate,
  create,
  del,
};

export default articleUserService;
