import { NextFunction, Response } from "express";

import { EUserStatus } from "../../enums/user.enum";

import validateHelper from "../../helpers/validate.helper";

// [POST] /admin/users/create
const createPost = (req: any, res: Response, next: NextFunction): void => {
  try {
    const fullName = req.body.fullName;
    const email = req.body.email;
    const password = req.body.password;
    const phone = req.body.phone;
    const status = req.body.status;
    const bio = req.body.bio;

    if (
      !fullName ||
      !email ||
      !password ||
      !phone ||
      !req.files["avatar"] ||
      !req.files["coverPhoto"] ||
      !status ||
      !bio
    ) {
      req.flash("error", "Input required!");
      return res.redirect("back");
    }

    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof phone !== "string" ||
      typeof status !== "string" ||
      typeof bio !== "string"
    ) {
      req.flash("error", "Datatype wrong!");
      return res.redirect("back");
    }

    if (!validateHelper.email(email)) {
      req.flash("error", "Email wrong!");
      return res.redirect("back");
    }

    if (!validateHelper.password(password)) {
      req.flash("error", "Passwords must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.!");
      return res.redirect("back");
    }

    if (!Object.values(EUserStatus).includes(status as EUserStatus)) {
      req.flash("error", "Status wrong!");
      return res.redirect("back");
    }

    return next();
  } catch {
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
}

// [PATCH] /admin/users/update/:id
const updatePatch = (req: any, res: Response, next: NextFunction): void => {
  try {
    const fullName = req.body.fullName;
    const email = req.body.email;
    const phone = req.body.phone;
    const status = req.body.status;
    const bio = req.body.bio;

    if (
      !fullName ||
      !email ||
      !phone ||
      !status ||
      !bio
    ) {
      req.flash("error", "Input required!");
      return res.redirect("back");
    }

    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof status !== "string" ||
      typeof bio !== "string"
    ) {
      req.flash("error", "Datatype wrong!");
      return res.redirect("back");
    }

    if (!validateHelper.email(email)) {
      req.flash("error", "Email wrong!");
      return res.redirect("back");
    }

    if (!Object.values(EUserStatus).includes(status as EUserStatus)) {
      req.flash("error", "Status wrong!");
      return res.redirect("back");
    }

    return next();
  } catch {
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
}

// [PATCH] /admin/users/actions
const actions = (req: any, res: Response, next: NextFunction): void => {
  try {
    const action = req.body.action;
    const ids = req.body.ids;

    if (
      !action ||
      !ids
    ) {
      req.flash("error", "Input required!");
      return res.redirect("back");
    }

    if (
      typeof action !== "string" ||
      typeof ids !== "string"
    ) {
      req.flash("error", "Datatype wrong!");
      return res.redirect("back");
    }

    return next();
  } catch {
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
}

// [PATCH] /admin/users/updateStatus/:status/:id
const updateStatus = (req: any, res: Response, next: NextFunction): void => {
  try {
    const status: string = req.params.status;

    if (!Object.values(EUserStatus).includes(status as EUserStatus)) {
      req.flash("error", "Status wrong!");
      return res.redirect("back");
    }

    return next();
  } catch {
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
}

const userValidate = {
  createPost,
  updatePatch,
  actions,
  updateStatus
};
export default userValidate;