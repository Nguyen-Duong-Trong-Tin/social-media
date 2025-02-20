import { Response } from "express";

import configs from "../../configs/index.config";

import authService from "../../services/admin/auth.service";

import md5Util from "../../utils/md5.util";
import jwtUtil from "../../utils/jwt.util";

// [GET] /admin/auth/login
const login = (req: any, res: Response): void => {
  try {
    return res.render("admin/pages/auth/login", { pageTitle: "Đăng Nhập" });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
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
      req.flash("error", "Đăng nhập không thành công!");
      return res.redirect("back");
    }

    const token = jwtUtil.accountGenerate(
      accountExists.id,
      accountExists.roleId,
      "1d"
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 60 * 24
    });

    return res.redirect(`/${configs.admin}/dashboard`);
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [POST] /admin/auth/logout
const logoutPost = (req: any, res: Response): void => {
  try {
    res.clearCookie("token");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

const authController = {
  login,
  loginPost,
  logoutPost
};
export default authController;