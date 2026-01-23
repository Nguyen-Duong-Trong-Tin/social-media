import { NextFunction, Response } from "express";

// [PATCH] /admin/permissions/update
const updatePatch = (req: any, res: Response, next: NextFunction): void => {
  try {
    return next();
  } catch {
    req.flash("error", "Something went wrong!");
  }
}

const permissionValidate = {
  updatePatch
};
export default permissionValidate;