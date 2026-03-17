import { RootFilterQuery, SortOrder } from "mongoose";

import MessageModel from "../../models/message.model";
import IMessage from "../../interfaces/message.interface";

const insertMany = async ({ docs }: { docs: Partial<IMessage>[] }) => {
  return await MessageModel.insertMany(docs);
};

const findOne = async ({
  filter,
}: {
  filter: RootFilterQuery<typeof MessageModel>;
}) => {
  return await MessageModel.findOne({ deleted: false, ...filter });
};

const findOneAndUpdate = async ({
  filter,
  update,
}: {
  filter: RootFilterQuery<typeof MessageModel>;
  update: Partial<IMessage>;
}) => {
  return await MessageModel.findOneAndUpdate(
    { deleted: false, ...filter },
    update,
    { new: true, runValidators: true }
  );
};

const countDocuments = async ({
  filter,
}: {
  filter: RootFilterQuery<typeof MessageModel>;
}) => {
  return await MessageModel.countDocuments({ deleted: false, ...filter });
};

const countDocumentsWithDeleted = async ({
  filter,
}: {
  filter: RootFilterQuery<typeof MessageModel>;
}) => {
  return await MessageModel.countDocuments({ ...filter });
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

const findWithDeleted = async ({
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
  return await MessageModel.find({ ...filter })
    .sort(sort)
    .skip(skip || 0)
    .limit(limit || 0);
};

const messageService = {
  insertMany,
  findOne,
  findOneAndUpdate,
  countDocuments,
  countDocumentsWithDeleted,
  find,
  findWithDeleted,
};
export default messageService;
