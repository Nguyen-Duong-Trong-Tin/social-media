import { Response } from "express";

import configs from "../../configs/index.config";

import { EAccountStatus } from "../../enums/account.enum";

import getUrlHelper from "../../helpers/getUrl.helper";

import roleService from "../../services/admin/role.service";
import accountService from "../../services/admin/account.service";

import md5Util from "../../utils/md5.util";

// [GET] /admin/accounts?page=:page&limit=:limit&keyword=:keyword&sort=title-asc
const get = async (req: any, res: Response): Promise<void> => {
  try {
    const filter: string = req.query.filter;
    const filterOptions: {
      value: string,
      title: string
    }[] = [
        { value: "", title: "---" },
        { value: "status-active", title: "Trạng thái hoạt động" },
        { value: "status-inactive", title: "Trạng thái ngưng hoạt động" },
      ];

    const sort: string = req.query.sort;
    const sortOptions: {
      value: string,
      title: string
    }[] = [
        { value: "", title: "---" },
        { value: "fullName-asc", title: "Họ tên tăng dần" },
        { value: "fullName-desc", title: "Họ tên giảm dần" },
        { value: "email-asc", title: "Email tăng dần" },
        { value: "email-desc", title: "Email giảm dần" },
        { value: "roleId-asc", title: "Gom nhóm theo vai trò" }
      ];

    const keyword: string = req.query.keyword;

    const actionOptions: {
      value: string,
      title: string
    }[] = [
        { value: "", title: "---" },
        { value: "delete", title: "Xóa" },
        { value: "active", title: "Hoạt động" },
        { value: "inactive", title: "Ngưng hoạt động" }
      ];

    const page: number = parseInt(req.query.page as string) || 1;
    const limit: number = parseInt(req.query.limit as string) || 10;

    const [maxPage, accounts] = await Promise.all([
      accountService.calculateMaxPage(limit),
      accountService.find(req)
    ]);
    const roles = await Promise.all(accounts.map(account => roleService.findById(account.roleId)));

    return res.render("admin/pages/accounts", {
      pageTitle: "Danh Sách Tài Khoản",
      url: getUrlHelper(req),
      accounts,
      roles,
      filter: {
        filter,
        filterOptions
      },
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
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [GET] /admin/accounts/detail/:id
const getById = async (req: any, res: Response): Promise<void> => {
  try {
    const id: string = req.params.id;

    const [
      accountExists,
      roles
    ] = await Promise.all([
      accountService.findById(id),
      roleService.findAll()
    ]);
    if (!accountExists) {
      req.flash("error", "Tài khoản không tồn tại!");
      return res.redirect("back");
    }

    const [
      createdBy,
      updatedBy
    ] = await Promise.all([
      accountService.findById(accountExists.createdBy.accountId as string).then(account => ({
        account,
        createdAt: accountExists.createdBy.createdAt as Date
      })),

      Promise.all(accountExists.updatedBy.map(item => accountService.findById(item.accountId as string).then(account => ({
        account,
        updatedAt: item.updatedAt as Date
      }))))
    ]);

    return res.render("admin/pages/accounts/detail", {
      pageTitle: "Chi Tiết Tài Khoản",
      account: accountExists,
      roles,
      createdBy,
      updatedBy
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [GET] /admin/accounts/create
const create = async (req: any, res: Response): Promise<void> => {
  try {
    const roles = await roleService.findAll();
    return res.render("admin/pages/accounts/create", {
      pageTitle: "Tạo Mới Tài Khoản",
      roles
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [POST] /admin/accounts/create
const createPost = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      roleId: string
    } = req.account;

    const fullName: string = req.body.fullName;
    const email: string = req.body.email;
    const password: string = md5Util.encode(req.body.password);
    const phone: string = req.body.phone;
    const avatar: string = req.file.path;
    const status: string = req.body.status;
    const roleId: string = req.body.roleId;

    const [
      accountEmailExists,
      accountPhoneExists,
      roleExists
    ] = await Promise.all([
      accountService.findByEmail(email),
      accountService.findByPhone(phone),
      roleService.findById(roleId)
    ]);
    if (accountEmailExists) {
      req.flash("error", "Email đã tồn tại!");
      return res.redirect("back");
    }
    if (accountPhoneExists) {
      req.flash("error", "Số điện thoại đã tồn tại!");
      return res.redirect("back");
    }
    if (!roleExists) {
      req.flash("error", "Vai trò không được tìm thấy!");
      return res.redirect("back");
    }

    await accountService.create({
      fullName,
      email,
      password,
      phone,
      avatar,
      status: status as EAccountStatus,
      roleId,
      createdBy: {
        accountId: myAccount.accountId,
        createdAt: new Date()
      },
      deleted: false
    });

    req.flash("success", "Tài khoản được tạo thành công!");
    return res.redirect(`/${configs.admin}/accounts`);
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [GET] /admin/accounts/update/:id
const update = async (req: any, res: Response): Promise<void> => {
  try {
    const id: string = req.params.id;

    const [
      accountExists,
      roles
    ] = await Promise.all([
      accountService.findById(id),
      roleService.findAll()
    ]);
    if (!accountExists) {
      req.flash("error", "Có lỗi xảy ra!");
      return res.redirect("back");
    }

    return res.render("admin/pages/accounts/update", {
      pageTitle: "Cập Nhật Tài Khoản",
      account: accountExists,
      roles
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [PATCH] /admin/accounts/update/:id
const updatePatch = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      roleId: string
    } = req.account;

    const id: string = req.params.id;

    const fullName: string = req.body.fullName;
    const email: string = req.body.email;
    const phone: string = req.body.phone;
    const status: string = req.body.status;
    const roleId: string = req.body.roleId;

    let avatar: string | undefined = undefined;
    if (req.file && req.file.path) {
      avatar = req.file.path
    }

    const [
      accountIdExists,
      accountEmailExists,
      accountPhoneExists,
      roleExists
    ] = await Promise.all([
      accountService.findById(id),
      accountService.findByEmail(email),
      accountService.findByPhone(phone),
      roleService.findById(roleId)
    ]);
    if (!accountIdExists) {
      req.flash("error", "Tài khoản không tồn tại!");
      return res.redirect("back");
    }
    if (
      accountEmailExists &&
      accountEmailExists.id !== id
    ) {
      req.flash("error", "Email đã tồn tại!");
      return res.redirect("back");
    }
    if (
      accountPhoneExists &&
      accountPhoneExists.id !== id
    ) {
      req.flash("error", "Số điện thoại đã tồn tại!");
      return res.redirect("back");
    }
    if (!roleExists) {
      req.flash("error", "Vai trò không tồn tại!");
      return res.redirect("back");
    }

    await accountService.update(id, {
      fullName,
      email,
      phone,
      avatar,
      status: status as EAccountStatus,
      roleId,
      $push: {
        updatedBy: {
          accountId: myAccount.accountId,
          updatedAt: new Date()
        }
      }
    });
    req.flash("success", "Tài khoản được cập nhật thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

// [PATCH] /admin/accounts/actions
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
        await Promise.all(ids.map(id => accountService.del(id, {
          accountId: myAccount.accountId,
          deletedAt: new Date()
        })));

        break;
      }

      case "active": {
        await Promise.all(ids.map(id => accountService.update(id, {
          status: EAccountStatus.active,
          $push: {
            updatedBy: {
              accountId: myAccount.accountId,
              updatedAt: new Date()
            }
          }
        })));

        break;
      }

      case "inactive": {
        await Promise.all(ids.map(id => accountService.update(id, {
          status: EAccountStatus.inactive,
          $push: {
            updatedBy: {
              accountId: myAccount.accountId,
              updatedAt: new Date()
            }
          }
        })));

        break;
      }

      default: {
        req.flash("error", "Hành động không chính xác!");
        return res.redirect("back");
      }
    }

    req.flash("success", "Các tài khoản được cập nhật thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

// [PATCH] /admin/accounts/updateStatus/:status/:id
const updateStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      roleId: string
    } = req.account;

    const id: string = req.params.id;
    const status: string = req.params.status;

    const accountExists = await accountService.findById(id);
    if (!accountExists) {
      req.flash("error", "Tài khoản không tồn tại!");
      return res.redirect("back");
    }

    await accountService.update(id, {
      status: status as EAccountStatus,
      $push: {
        updatedBy: {
          accountId: myAccount.accountId,
          updatedAt: new Date()
        }
      }
    });
    req.flash("success", "Tài khoản được cập nhật thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

// [DELETE] /admin/accounts/delete/:id
const del = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      roleId: string
    } = req.account;

    const id: string = req.params.id;

    const accountExists = await accountService.findById(id);
    if (!accountExists) {
      req.flash("error", "Tài khoản không tồn tại!");
      return res.redirect("back");
    }

    await accountService.del(id, {
      accountId: myAccount.accountId,
      deletedAt: new Date()
    });
    req.flash("success", "Tài khoản được xóa thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

const accountController = {
  get,
  getById,
  create,
  createPost,
  update,
  updatePatch,
  actions,
  updateStatus,
  del
};
export default accountController;