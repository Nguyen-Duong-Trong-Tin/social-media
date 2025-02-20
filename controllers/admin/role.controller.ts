import { Response } from "express";

import configs from "../../configs/index.config";

import getUrlHelper from "../../helpers/getUrl.helper";

import roleService from "../../services/admin/role.service";
import accountService from "../../services/admin/account.service";

// [GET] /admin/roles?page=:page&limit=:limit&keyword=:keyword&sort=title-asc
const get = async (req: any, res: Response): Promise<void> => {
  try {
    const sort: string = req.query.sort;
    const sortOptions: {
      value: string,
      title: string
    }[] = [
        { value: "", title: "---" },
        { value: "title-asc", title: "Tiêu đề tăng dần" },
        { value: "title-desc", title: "Tiêu đề giảm dần" }
      ];

    const keyword: string = req.query.keyword;

    const actionOptions: {
      value: string,
      title: string
    }[] = [
        { value: "", title: "---" },
        { value: "delete", title: "Xóa" }
      ];

    const page: number = parseInt(req.query.page as string) || 1;
    const limit: number = parseInt(req.query.limit as string) || 10;

    const [maxPage, roles] = await Promise.all([
      roleService.calculateMaxPage(limit),
      roleService.find(req)
    ]);

    return res.render("admin/pages/roles", {
      pageTitle: "Danh Sách Vai Trò",
      url: getUrlHelper(req),
      roles,
      sort: {
        sort,
        sortOptions
      },
      keyword,
      actionOptions,
      pagination: {
        page,
        limit,
        maxPage
      }
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra");
    return res.redirect("back");
  }
}

// [GET] /admin/roles/detail/:id
const getById = async (req: any, res: Response): Promise<void> => {
  try {
    const id: string = req.params.id;

    const roleExists = await roleService.findById(id);
    if (!roleExists) {
      req.flash("error", "Vai trò không tồn tại!");
      return res.redirect("back");
    }

    const [
      createdBy,
      updatedBy
    ] = await Promise.all([
      accountService.findById(roleExists.createdBy.accountId as string).then(account => ({
        account,
        createdAt: roleExists.createdBy.createdAt as Date
      })),

      Promise.all(roleExists.updatedBy.map(item => accountService.findById(item.accountId as string).then(account => ({
        account,
        updatedAt: item.updatedAt as Date
      }))))
    ]);

    return res.render("admin/pages/roles/detail", {
      pageTitle: "Chi Tiết Vai Trò",
      role: roleExists,
      createdBy,
      updatedBy
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [GET] /admin/roles/create
const create = (req: any, res: Response): void => {
  try {
    return res.render("admin/pages/roles/create", {
      pageTitle: "Thêm Mới Vai Trò"
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [POST] /admin/roles/create
const createPost = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      roleId: string
    } = req.account;

    const title: string = req.body.title;
    const description: string = req.body.description;

    await roleService.create({
      title,
      description,
      permission: [],
      createdBy: {
        accountId: myAccount.accountId,
        createdAt: new Date()
      },
      deleted: false
    });

    req.flash("success", "Vai trò được tạo thành công!");
    return res.redirect(`/${configs.admin}/roles`);
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [GET] /admin/roles/update/:id
const update = async (req: any, res: Response): Promise<void> => {
  try {
    const id: string = req.params.id;

    const roleExists = await roleService.findById(id);
    if (!roleExists) {
      req.flash("error", "Vai trò không tồn tại!");
      return res.redirect("back");
    }

    return res.render("admin/pages/roles/update", {
      pageTitle: "Cập Nhật Vai Trò",
      role: roleExists
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [PATCH] /admin/roles/update/:id
const updatePatch = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      roleId: string
    } = req.account;

    const id: string = req.params.id;

    const title: string = req.body.title;
    const description: string = req.body.description;

    const roleExists = await roleService.findById(id);
    if (!roleExists) {
      req.flash("error", "Vai trò không tồn tại!");
      return req.redirect("back");
    }

    await roleService.update(id, {
      title,
      description,
      $push: {
        updatedBy: {
          accountId: myAccount.accountId,
          updatedAt: new Date()
        }
      }
    },);

    req.flash("success", "Vai trò được cập nhật thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

// [PATCH] /admin/roles/actions
const actions = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      roleId: string
    } = req.account;

    const action: string = req.body.action;
    const ids: string[] = req.body.ids.split(',');

    switch (action) {
      case "delete": {
        await Promise.all(ids.map(id => roleService.del(id, {
          accountId: myAccount.accountId,
          deletedAt: new Date()
        })));

        break;
      }

      default: {
        req.flash("error", "Hành động không chính xác!");
        return res.redirect("back");
      }
    }

    req.flash("success", "Các vai trò được cập nhật thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

// [DELETE] /admin/roles/delete/:id
const del = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      roleId: string;
    } = req.account;

    const id: string = req.params.id;

    const roleExists = await roleService.findById(id);
    if (!roleExists) {
      req.flash("error", "Vai trò không tồn tại!");
      return res.redirect("back");
    }

    await roleService.del(id, {
      accountId: myAccount.accountId,
      deletedAt: new Date()
    });

    req.flash("success", "Vai trò được xóa thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

const roleController = {
  get,
  getById,
  create,
  createPost,
  update,
  updatePatch,
  actions,
  del
};
export default roleController;