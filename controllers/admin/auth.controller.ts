import { Response } from "express";

import configs from "../../configs/index.config";

import authService from "../../services/admin/auth.service";

import md5Util from "../../utils/md5.util";
import jwtUtil from "../../utils/jwt.util";
import roleService from "../../services/admin/role.service";

// [GET] /admin/auth/login
const login = (req: any, res: Response): void => {
  try {
    return res.render("admin/pages/auth/login", { pageTitle: "Login page" });
  } catch {
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
}

// [POST] /admin/auth/login
const loginPost = async (req: any, res: Response): Promise<void> => {
  try {
    const email: string = req.body.email;
    const password: string = md5Util.encode(req.body.password);

    const accountExists = await authService.login(email, password);
    if (!accountExists) {
      req.flash("error", "Login failed!");
      return res.redirect("back");
    }

    const roleExists = await roleService.findById(accountExists.roleId);
    if (!roleExists) {
      req.flash("error", "Role not found!");
      return res.redirect("back");
    }

    const token = jwtUtil.accountGenerate(
      accountExists.id,
      roleExists.permissions,
      "1d"
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 60 * 24
    });

    return res.redirect(`/${configs.admin}/dashboard`);
  } catch (e){
    console.log(e);
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
}

// [POST] /admin/auth/logout
const logoutPost = (req: any, res: Response): void => {
  try {
    res.clearCookie("token");
  } catch {
    req.flash("error", "Something went wrong!");
  }
  return res.redirect("back");
}

const authController = {
  login,
  loginPost,
  logoutPost
};
export default authController;