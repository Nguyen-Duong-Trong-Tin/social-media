import { NextFunction, Response } from "express";

import configs from "../../configs/index.config";
import jwtUtil from "../../utils/jwt.util";
import accountService from "../../services/admin/account.service";

const deserialize = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token: string = req.cookies.token;

    if (!token) {
      req.flash("error", "Login to continue!");
      return res.redirect(`/${configs.admin}/auth/login`);
    }

    const verify: {
      success: boolean;
      account: {
        accountId: string;
        permissions: string[];
        fullName?: string;
      };
    } = jwtUtil.accountVerify(token);
    if (!verify.success) {
      req.flash("error", "Login to continue!");
      return res.redirect(`/${configs.admin}/auth/login`);
    }

    const accountExists = await accountService.findById(
      verify.account.accountId,
    );
    if (!accountExists) {
      req.flash("error", "Login to continue!");
      return res.redirect(`/${configs.admin}/auth/login`);
    }

    res.locals.myAccount = {
      ...verify.account,
      fullName: accountExists.fullName,
    };
    return next();
  } catch {
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
};

export default deserialize;
