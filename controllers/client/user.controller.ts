import { Request, Response } from "express";

import userService from "../../services/client/user.service";
import sortHelper from "../../helpers/sort.helper";
import paginationHelper from "../../helpers/pagination.helper";
import { RootFilterQuery } from "mongoose";
import UserModel from "../../models/user.model";
import IUser from "../../interfaces/user.interface";

// POST /v1/users/check-exists/email
const checkExistsEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const userExists = await userService.findOne({
      filter: { email },
      select: "-password",
    });
    if (!userExists) {
      return res.status(404).json({
        status: false,
        message: "User email not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "User found",
      data: userExists,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// POST /v1/users/check-exists/phone
const checkExistsPhone = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    const userExists = await userService.findOne({
      filter: { phone },
      select: "-password",
    });
    if (!userExists) {
      return res.status(404).json({
        status: false,
        message: "User phone not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "User found",
      data: userExists,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// POST /v1/users/ids
const findUsersByIds = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    const users = await userService.find({
      filter: { _id: { $in: ids } },
      select: "-password",
    });
    const map = new Map<string, IUser>();
    for (const user of users) {
      map.set(user.id, user as IUser);
    }
    const usersOrdered: IUser[] = ids.map((id: string) => map.get(id) ?? null);

    if (usersOrdered.some((userOrdered) => !userOrdered)) {
      return res.status(404).json({
        status: false,
        message: "Some user ids not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Users found",
      data: usersOrdered,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// GET /v1/users?sort&page&limit&filter
const findUsers = async (req: Request, res: Response) => {
  try {
    const filter = req.query.filter as string;

    const sort = sortHelper(req);
    const pagination = paginationHelper(req);
    const filterOptions: RootFilterQuery<typeof UserModel> = {};

    if (filter) {
      const { fullName, slug, notInIds } = JSON.parse(filter);

      if (fullName) {
        filterOptions.fullName = new RegExp(fullName, "i");
      }

      if (slug) {
        filterOptions.slug = new RegExp(slug, "i");
      }

      if (notInIds) {
        const ids = JSON.parse(notInIds);

        filterOptions["_id"] = { $nin: ids };
      }
    }

    const [total, items] = await Promise.all([
      userService.countDocuments({ filter: filterOptions }),
      userService.find({
        filter: filterOptions,
        skip: pagination.skip,
        limit: pagination.limit,
        sort,
      }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Users found",
      data: {
        users: {
          total,
          page: pagination.page,
          limit: pagination.limit,
          items,
        },
      },
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// GET /v1/users/:id
const findUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const userExists = await userService.findOne({ filter: { _id: id } });
    if (!userExists) {
      return res.status(404).json({
        status: false,
        message: "User id not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "User found",
      data: userExists,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// GET /v1/users/slug/:slug
const findUserBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const userExists = await userService.findOne({
      filter: { slug },
      select: "-password",
    });

    if (!userExists) {
      return res.status(404).json({
        status: false,
        message: "User slug not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "User found",
      data: userExists,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// PATCH /v1/users/bio/:id
const updateBio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { bio } = req.body;

    const userExists = await userService.findOneAndUpdate({
      filter: { _id: id },
      update: { bio },
      select: "-password",
    });
    if (!userExists) {
      return res.status(404).json({
        status: false,
        message: "User id not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Update successfully",
      data: userExists,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

const userController = {
  checkExistsEmail,
  checkExistsPhone,
  findUsers,
  findUserById,
  findUsersByIds,
  findUserBySlug,
  updateBio,
};
export default userController;
