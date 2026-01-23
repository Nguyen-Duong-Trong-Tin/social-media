import { NextFunction, Response } from "express";

// [POST] /admin/roles/create
const createPost = (req: any, res: Response, next: NextFunction): void => {
  try {
    const title = req.body.title;
    const description = req.body.description;

    if (
      !title ||
      !description
    ) {
      req.flash("error", "Input required!");
      return res.redirect("back");
    }

    if (
      typeof title !== "string" ||
      typeof description !== "string"
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

// [PATCH] /admin/roles/update/:id
const updatePatch = (req: any, res: Response, next: NextFunction): void => {
  try {
    const title = req.body.title;
    const description = req.body.description;

    if (
      !title ||
      !description
    ) {
      req.flash("error", "Input required!");
      return res.redirect("back");
    }

    if (
      typeof title !== "string" ||
      typeof description !== "string"
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

// [PATCH] /admin/roles/actions
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

const roleValidate = {
  createPost,
  updatePatch,
  actions
};
export default roleValidate;