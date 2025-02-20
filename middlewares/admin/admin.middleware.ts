import { NextFunction, Response } from "express";

import configs from "../../configs/index.config";

const variable = (req: any, res: Response, next: NextFunction): void => {
  try {
    res.locals.admin = configs.admin;
    return next();
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

const redirect = (req: any, res: Response): void => {
  try {
    return res.redirect(`/${configs.admin}/auth/login`);
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

const adminMiddleware = {
  variable,
  redirect
};
export default adminMiddleware;