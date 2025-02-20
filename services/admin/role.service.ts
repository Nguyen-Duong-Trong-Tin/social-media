import { Request } from "express";
import { SortOrder } from "mongoose";

import paginationHelper from "../../helpers/pagination.helper";
import sortHelper from "../../helpers/sort.helper";

import IRole from "../../interfaces/role.interface";

import RoleModel from "../../models/role.model";

const findAll = async () => {
  const roles = await RoleModel.find({ deleted: false });
  return roles;
}

const find = async (req: Request) => {
  const pagination: {
    limit: number;
    skip: number;
  } = paginationHelper(req);

  const find: {
    deleted: boolean,
    title?: RegExp
  } = { deleted: false };

  if (req.query.keyword) {
    find.title = new RegExp(req.query.keyword as string, "i");
  }

  const sort: { [key: string]: SortOrder } = sortHelper(req);

  const roles = await RoleModel
    .find(find)
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit);
  return roles;
}

const findById = async (id: string) => {
  const roleExists = await RoleModel.findOne({
    _id: id,
    deleted: false
  });
  return roleExists;
}

const calculateMaxPage = async (limit: number) => {
  const quantity: number = await RoleModel.countDocuments({ deleted: false });
  return Math.ceil(quantity / limit);
}

const create = async (role: Partial<IRole>) => {
  const newRole = new RoleModel(role);
  await newRole.save();
  return newRole;
}

const update = async (
  id: string,
  role: Partial<IRole> & {
    $push: {
      updatedBy: {
        accountId: string,
        updatedAt: Date
      }
    }
  }
) => {
  const newRole = await RoleModel.updateOne({
    _id: id,
    deleted: false
  }, role, {
    new: true,
    runValidators: true
  });
  return newRole;
}

const del = async (
  id: string,
  deletedBy: {
    accountId: string,
    deletedAt: Date
  }
) => {
  const newRole = await RoleModel.updateOne({
    _id: id,
    deleted: false
  }, {
    deleted: true,
    deletedBy
  }, {
    new: true,
    runValidators: true
  });
  return newRole;
}

const roleService = {
  findAll,
  find,
  findById,
  calculateMaxPage,
  create,
  update,
  del
};
export default roleService;