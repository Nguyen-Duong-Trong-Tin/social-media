import { RootFilterQuery, UpdateQuery } from "mongoose";

import NotificationModel from "../../models/notification.model";
import INotification from "../../interfaces/notification.interface";

const insertMany = async ({ docs }: { docs: Partial<INotification>[] }) => {
  return await NotificationModel.insertMany(docs);
};

const countDocuments = async ({
  filter,
}: {
  filter: RootFilterQuery<INotification>;
}) => {
  return await NotificationModel.countDocuments({ deleted: false, ...filter });
};

const find = async ({
  filter,
  sort,
  skip,
  limit,
}: {
  filter: RootFilterQuery<INotification>;
  sort?: { [key: string]: 1 | -1 };
  skip?: number;
  limit?: number;
}) => {
  return await NotificationModel.find({ deleted: false, ...filter })
    .sort(sort)
    .skip(skip || 0)
    .limit(limit || 0);
};

const updateMany = async ({
  filter,
  update,
}: {
  filter: RootFilterQuery<INotification>;
  update: UpdateQuery<INotification>;
}) => {
  return await NotificationModel.updateMany(filter, update);
};

const notificationService = {
  insertMany,
  countDocuments,
  find,
  updateMany,
};
export default notificationService;
