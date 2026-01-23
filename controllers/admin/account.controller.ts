import { Response } from "express";

import configs from "../../configs/index.config";

import { EAccountStatus } from "../../enums/account.enum";

import getUrlHelper from "../../helpers/getUrl.helper";

import roleService from "../../services/admin/role.service";
import accountService from "../../services/admin/account.service";

import md5Util from "../../utils/md5.util";
import slugUtil from "../../utils/slug.util";
import shortUniqueKeyUtil from "../../utils/shortUniqueKey.util";

// [GET] /admin/accounts?page=:page&limit=:limit&keyword=:keyword&sort=:sort&filter=:filter
const get = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("accountView")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/dashboard`);
    }

    const filter: string = req.query.filter;
    const filterOptions: {
      value: string,
      title: string
    }[] = [
        { value: "", title: "---" },
        { value: "status-active", title: "Active status" },
        { value: "status-inactive", title: "Inactive status" },
      ];

    const sort: string = req.query.sort;
    const sortOptions: {
      value: string,
      title: string
    }[] = [
        { value: "", title: "---" },
        { value: "fullName-asc", title: "Title (A - Z)" },
        { value: "fullName-desc", title: "Title (Z - A)" },
        { value: "email-asc", title: "Email (A - Z)" },
        { value: "email-desc", title: "Email (Z - A)" },
        { value: "roleId-asc", title: "Group by role" }
      ];

    const keyword: string = req.query.keyword;

    const actionOptions: {
      value: string,
      title: string
    }[] = [
        { value: "", title: "---" },
        { value: "delete", title: "Delete" },
        { value: "active", title: "Active" },
        { value: "inactive", title: "Inactive" }
      ];

    const page: number = parseInt(req.query.page as string) || 1;
    const limit: number = parseInt(req.query.limit as string) || 10;

    const [maxPage, accounts] = await Promise.all([
      accountService.calculateMaxPage(limit),
      accountService.find(req)
    ]);
    const roles = await Promise.all(accounts.map(account => roleService.findById(account.roleId)));

    return res.render("admin/pages/accounts", {
      pageTitle: "List of accounts",
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
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
}

// [GET] /admin/accounts/detail/:id
const getById = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("accountView")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/dashboard`);
    }

    const id: string = req.params.id;

    const [
      accountExists,
      roles
    ] = await Promise.all([
      accountService.findById(id),
      roleService.findAll()
    ]);
    if (!accountExists) {
      req.flash("error", "Account not found!");
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
      pageTitle: "Account details",
      account: accountExists,
      roles,
      createdBy,
      updatedBy
    });
  } catch {
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
}

// [GET] /admin/accounts/create
const create = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("accountCreate")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/accounts`);
    }

    const roles = await roleService.findAll();
    return res.render("admin/pages/accounts/create", {
      pageTitle: "Tạo Mới Tài Khoản",
      roles
    });
  } catch {
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
}

// [POST] /admin/accounts/create
const createPost = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("accountCreate")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/accounts`);
    }

    const fullName: string = req.body.fullName;
    const slug: string = slugUtil.convert(fullName) + '-' + shortUniqueKeyUtil.generate();
    const email: string = req.body.email;
    const password: string = md5Util.encode(req.body.password);
    const phone: string = req.body.phone;
    const avatar: string = req.file.path;
    const status: string = req.body.status;
    const roleId: string = req.body.roleId;

    const [
      accountSlugExists,
      accountEmailExists,
      accountPhoneExists,
      roleExists
    ] = await Promise.all([
      accountService.findBySlug(slug),
      accountService.findByEmail(email),
      accountService.findByPhone(phone),
      roleService.findById(roleId)
    ]);
    if (accountSlugExists) {
      req.flash("error", "Something went wrong!");
      return res.redirect("back");
    }
    if (accountEmailExists) {
      req.flash("error", "Email already exists!");
      return res.redirect("back");
    }
    if (accountPhoneExists) {
      req.flash("error", "Phone already exists!");
      return res.redirect("back");
    }
    if (!roleExists) {
      req.flash("error", "Role not found!");
      return res.redirect("back");
    }

    await accountService.create({
      fullName,
      slug,
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

    req.flash("success", "Account was created successfully!");
    return res.redirect(`/${configs.admin}/accounts`);
  } catch(e) {
    console.log(e);
    
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
}

// [GET] /admin/accounts/update/:id
const update = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("accountUpdate")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/accounts`);
    }

    const id: string = req.params.id;

    const [
      accountExists,
      roles
    ] = await Promise.all([
      accountService.findById(id),
      roleService.findAll()
    ]);
    if (!accountExists) {
      req.flash("error", "Account not found!");
      return res.redirect("back");
    }

    return res.render("admin/pages/accounts/update", {
      pageTitle: "Update account",
      account: accountExists,
      roles
    });
  } catch {
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
}

// [PATCH] /admin/accounts/update/:id
const updatePatch = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("accountUpdate")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/accounts`);
    }

    const id: string = req.params.id;

    const fullName: string = req.body.fullName;
    const slug: string = slugUtil.convert(fullName) + '-' + shortUniqueKeyUtil.generate();
    const email: string = req.body.email;
    const phone: string = req.body.phone;
    const status: string = req.body.status;
    const roleId: string = req.body.roleId;

    let avatar: string | undefined = undefined;
    if (req.file) {
      avatar = req.file.path
    }

    const [
      accountIdExists,
      accountSlugExists,
      accountEmailExists,
      accountPhoneExists,
      roleExists
    ] = await Promise.all([
      accountService.findById(id),
      accountService.findBySlug(slug),
      accountService.findByEmail(email),
      accountService.findByPhone(phone),
      roleService.findById(roleId)
    ]);
    if (!accountIdExists) {
      req.flash("error", "Account not found!");
      return res.redirect("back");
    }
    if (accountSlugExists) {
      req.flash("error", "Something went wrong!");
      return res.redirect("back");
    }
    if (
      accountEmailExists &&
      accountEmailExists.id !== id
    ) {
      req.flash("error", "Email already exists!");
      return res.redirect("back");
    }
    if (
      accountPhoneExists &&
      accountPhoneExists.id !== id
    ) {
      req.flash("error", "Phone already exists!");
      return res.redirect("back");
    }
    if (!roleExists) {
      req.flash("error", "Role not found!");
      return res.redirect("back");
    }

    await accountService.update(id, {
      fullName,
      slug,
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
    req.flash("success", "Account was updated successfully!");
  } catch {
    req.flash("error", "Something went wrong!");
  }
  return res.redirect("back");
}

// [PATCH] /admin/accounts/actions
const actions = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    const action: string = req.body.action;
    const ids: string[] = req.body.ids.split(',');

    switch (action) {
      case "delete": {
        if (!myAccount.permissions.includes("accountDelete")) {
          req.flash("error", "Access denied!");
          return res.redirect(`/${configs.admin}/accounts`);
        }

        await Promise.all(ids.map(id => accountService.del(id, {
          accountId: myAccount.accountId,
          deletedAt: new Date()
        })));

        break;
      }

      case "active": {
        if (!myAccount.permissions.includes("accountUpdate")) {
          req.flash("error", "Access denied!");
          return res.redirect(`/${configs.admin}/accounts`);
        }

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
        if (!myAccount.permissions.includes("accountUpdate")) {
          req.flash("error", "Access denied!");
          return res.redirect(`/${configs.admin}/accounts`);
        }

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
        req.flash("error", "Action wrong!");
        return res.redirect("back");
      }
    }

    req.flash("success", "Accounts were updated successfully!");
  } catch {
    req.flash("error", "Something went wrong!");
  }
  return res.redirect("back");
}

// [PATCH] /admin/accounts/updateStatus/:status/:id
const updateStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("accountUpdate")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/accounts`);
    }

    const id: string = req.params.id;
    const status: string = req.params.status;

    const accountExists = await accountService.findById(id);
    if (!accountExists) {
      req.flash("error", "Account not found!");
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
    req.flash("success", "Account was updated successfully!");
  } catch {
    req.flash("error", "Something went wrong!");
  }
  return res.redirect("back");
}

// [DELETE] /admin/accounts/delete/:id
const del = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("accountDelete")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/accounts`);
    }

    const id: string = req.params.id;

    const accountExists = await accountService.findById(id);
    if (!accountExists) {
      req.flash("error", "Account not found!");
      return res.redirect("back");
    }

    await accountService.del(id, {
      accountId: myAccount.accountId,
      deletedAt: new Date()
    });
    req.flash("success", "Account was deleted successfully!");
  } catch {
    req.flash("error", "Something went wrong!");
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