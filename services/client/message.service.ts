import { RootFilterQuery, SortOrder } from "mongoose";

import MessageModel from "../../models/message.model";
import IMessage from "../../interfaces/message.interface";

const insertMany = async ({ docs }: { docs: Partial<IMessage>[] }) => {
  return await MessageModel.insertMany(docs);
};

const countDocuments = async ({
  filter,
}: {
  filter: RootFilterQuery<typeof MessageModel>;
}) => {
  return await MessageModel.countDocuments({ deleted: false, ...filter });
};

const find = async ({
  filter,
  sort,
  skip,
  limit,
}: {
  filter: RootFilterQuery<typeof MessageModel>;
  sort?: { [key: string]: SortOrder };
  skip?: number;
  limit?: number;
}) => {
  return await MessageModel.find({ deleted: false, ...filter })
    .sort(sort)
    .skip(skip || 0)
    .limit(limit || 0);
};

const messageService = {
  insertMany,
  countDocuments,
  find,
};
export default messageService;
