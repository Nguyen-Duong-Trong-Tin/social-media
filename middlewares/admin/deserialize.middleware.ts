import { NextFunction, Response } from "express";

import configs from "../../configs/index.config";
import jwtUtil from "../../utils/jwt.util";

const deserialize = (req: any, res: Response, next: NextFunction) => {
  try {
    const token: string = req.cookies.token;

    if (!token) {
      req.flash("error", "Đăng nhập để tiếp tục!");
      return res.redirect(`/${configs.admin}/auth/login`);
    }

    const verify: {
      success: boolean;
      account: {
        accountId: string;
        roleId: string;
      };
    } = jwtUtil.accountVerify(token);
    if (!verify.success) {
      req.flash("error", "Đăng nhập để tiếp tục!");
      return res.redirect(`/${configs.admin}/auth/login`);
    }

    req.account = verify.account;
    return next();
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

export default deserialize;