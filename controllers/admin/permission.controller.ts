import { Response } from "express";

import configs from "../../configs/index.config";

import roleService from "../../services/admin/role.service";

// [GET] /admin/permissions
const get = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("roleUpdate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/dashboard`);
    }

    const roles = await roleService.findAll();
    return res.render("admin/pages/permissions", {
      pageTitle: "Phân Quyền",
      roles
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [PATCH] /admin/permissions/update
const updatePatch = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("roleUpdate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/dashboard`);
    }

    const roles = await roleService.findAll();
    await Promise.all(roles.map(role => {
      const id = role.id;
      const permissions = req.body[role.id].split(',');

      return roleService.update(id, {
        permissions,
        $push: {
          updatedBy: {
            accountId: myAccount.accountId,
            updatedAt: new Date()
          }
        }
      });
    }));

    req.flash("success", "Quyền được cập nhật thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

const permissionController = {
  get,
  updatePatch
};
export default permissionController;