import { RootFilterQuery, SortOrder, UpdateQuery } from "mongoose";

import ArticleGroupModel from "../../models/articleGroup.model";
import IArticleGroup from "../../interfaces/articleGroup.interface";

const countDocuments = async ({
  filter,
}: {
  filter: RootFilterQuery<typeof ArticleGroupModel>;
}) => {
  return await ArticleGroupModel.countDocuments({ deleted: false, ...filter });
};

const find = async ({
  filter,
  select,
  sort,
  skip,
  limit,
}: {
  filter: RootFilterQuery<typeof ArticleGroupModel>;
  select?: string;
  sort?: { [key: string]: SortOrder };
  skip?: number;
  limit?: number;
}) => {
  return await ArticleGroupModel.find({ deleted: false, ...filter })
    .select(select || "")
    .sort(sort)
    .skip(skip || 0)
    .limit(limit || 20);
};

const findOne = async ({
  filter,
}: {
  filter: RootFilterQuery<typeof ArticleGroupModel>;
}) => {
  return await ArticleGroupModel.findOne({ deleted: false, ...filter });
};

const findOneAndUpdate = ({
  filter,
  update,
}: {
  filter: RootFilterQuery<typeof ArticleGroupModel>;
  update: UpdateQuery<IArticleGroup>;
}) => {
  return ArticleGroupModel.findOneAndUpdate(
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

const create = async ({ doc }: { doc: Partial<IArticleGroup> }) => {
  const newArticleGroup = new ArticleGroupModel(doc);
  await newArticleGroup.save();
  return newArticleGroup;
};

const del = async ({ id }: { id: string }) => {
  return ArticleGroupModel.findOneAndUpdate(
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

const articleGroupService = {
  countDocuments,
  find,
  findOne,
  findOneAndUpdate,
  create,
  del,
};

export default articleGroupService;
