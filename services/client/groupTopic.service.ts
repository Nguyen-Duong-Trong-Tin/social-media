import { RootFilterQuery, SortOrder } from "mongoose";

import GroupTopicModel from "../../models/groupTopic.model";

const countDocuments = async ({
  filter,
}: {
  filter: RootFilterQuery<typeof GroupTopicModel>;
}) => {
  return await GroupTopicModel.countDocuments({ deleted: false, ...filter });
};

const find = async ({
  filter,
  select,
  sort,
  skip,
  limit,
}: {
  filter: RootFilterQuery<typeof GroupTopicModel>;
  select?: string;
  sort?: { [key: string]: SortOrder };
  skip?: number;
  limit?: number;
}) => {
  return await GroupTopicModel.find({ deleted: false, ...filter })
    .select(select || "")
    .sort(sort)
    .skip(skip || 0)
    .limit(limit || 20);
};

const findOne = async ({
  filter,
  select,
}: {
  filter: RootFilterQuery<typeof GroupTopicModel>;
  select?: string;
}) => {
  return await GroupTopicModel.findOne({ deleted: false, ...filter }).select(
    select || ""
  );
};

const groupTopicService = {
  countDocuments,
  find,
  findOne,
};
export default groupTopicService;
