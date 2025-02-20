import { Request } from "express";
import { SortOrder } from "mongoose";

import paginationHelper from "../../helpers/pagination.helper";
import sortHelper from "../../helpers/sort.helper";

import IAccount from "../../interfaces/account.interface";

import AccountModel from "../../models/account.model";
import filterHelper from "../../helpers/filter.helper";

const find = async (req: Request) => {
  const pagination: {
    limit: number;
    skip: number;
  } = paginationHelper(req);

  const find: {
    deleted: boolean,
    email?: RegExp
  } = { deleted: false };

  if (req.query.keyword) {
    find.email = new RegExp(req.query.keyword as string, "i");
  }

  const filter: { [key: string]: any } = filterHelper(req);

  const sort: { [key: string]: SortOrder } = sortHelper(req);

  const accounts = await AccountModel
    .find({
      ...find,
      ...filter
    })
    .select("-password")
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit);;
  return accounts;
}

const findById = async (id: string) => {
  const accountExists = await AccountModel
    .findOne({
      _id: id,
      deleted: false
    })
    .select("-password");
  return accountExists;
}

const findByEmail = async (email: string) => {
  const accountExists = await AccountModel
    .findOne({
      email,
      deleted: false
    })
    .select("-password");
  return accountExists;
}

const findByPhone = async (phone: string) => {
  const accountExists = await AccountModel
    .findOne({
      phone,
      deleted: false
    })
    .select("-password");
  return accountExists;
}

const calculateMaxPage = async (limit: number) => {
  const quantity: number = await AccountModel.countDocuments({ deleted: false });
  return Math.ceil(quantity / limit);
}

const create = async (account: Partial<IAccount>) => {
  const newAccount = new AccountModel(account);
  await newAccount.save();

  const accountExists = await AccountModel
    .findOne({ _id: newAccount.id })
    .select("-password");
  return accountExists;
}

const update = async (
  id: string,
  account: Partial<IAccount> & {
    $push: {
      updatedBy: {
        accountId: string,
        updatedAt: Date
      }
    }
  }
) => {
  const newAccount = await AccountModel
    .updateOne({
      _id: id,
      deleted: false
    }, account, {
      new: true,
      runValidators: true
    })
    .select("-password");
  return newAccount;
}

const del = async (
  id: string,
  deletedBy: {
    accountId: string,
    deletedAt: Date
  }
) => {
  const newAccount = await AccountModel.updateOne({
    _id: id,
    deleted: false
  }, {
    deleted: true,
    deletedBy
  }, {
    new: true,
    runValidators: true
  });
  return newAccount;
}

const accountService = {
  find,
  findById,
  findByEmail,
  findByPhone,
  calculateMaxPage,
  create,
  update,
  del
};
export default accountService;