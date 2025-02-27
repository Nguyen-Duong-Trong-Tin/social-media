import { Response } from "express";

import configs from "../../configs/index.config";

import { EUserOnline, EUserStatus } from "../../enums/user.enum";

import getUrlHelper from "../../helpers/getUrl.helper";

import userService from "../../services/admin/user.service";

import md5Util from "../../utils/md5.util";
import slugUtil from "../../utils/slug.util";
import shortUniqueKeyUtil from "../../utils/shortUniqueKey.util";

// [GET] /admin/users
const get = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("userView")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/dashboard`);
    }

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
        { value: "email-desc", title: "Email giảm dần" }
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

    const [maxPage, users] = await Promise.all([
      userService.calculateMaxPage(limit),
      userService.find(req)
    ]);

    return res.render("admin/pages/users", {
      pageTitle: "Danh Sách Người Dùng",
      url: getUrlHelper(req),
      users,
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

// [GET] /admin/users/detail/:id
const getById = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("userView")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/dashboard`);
    }

    const id: string = req.params.id;

    const userExists = await userService.findById(id);
    if (!userExists) {
      req.flash("error", "Người dùng không tồn tại!");
      return res.redirect("back");
    }

    return res.render("admin/pages/users/detail", {
      pageTitle: "Chi Tiết Người Dùng",
      user: userExists
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [GET] /admin/users/create
const create = (req: any, res: Response): void => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("userCreate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/users`);
    }

    return res.render("admin/pages/users/create", {
      pageTitle: "Tạo Mới Người Dùng",
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [POST] /admin/users/create
const createPost = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("userCreate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/users`);
    }

    const fullName: string = req.body.fullName;
    const slug: string = slugUtil.convert(fullName) + '-' + shortUniqueKeyUtil.generate();
    const email: string = req.body.email;
    const password: string = md5Util.encode(req.body.password);
    const phone: string = req.body.phone;
    const avatar: string = req.files["avatar"][0].path;
    const coverPhoto: string = req.files["coverPhoto"][0].path;
    const bio: string = req.body.bio;
    const status: string = req.body.status;

    const [
      userSlugExists,
      userEmailExists,
      userPhoneExists
    ] = await Promise.all([
      userService.findBySlug(slug),
      userService.findByEmail(email),
      userService.findByPhone(phone)
    ]);
    if (userSlugExists) {
      req.flash("error", "Có lỗi xảy ra!");
      return res.redirect("back");
    }
    if (userEmailExists) {
      req.flash("error", "Email đã tồn tại!");
      return res.redirect("back");
    }
    if (userPhoneExists) {
      req.flash("error", "Số điện thoại đã tồn tại!");
      return res.redirect("back");
    }

    await userService.create({
      fullName,
      slug,
      email,
      password,
      phone,
      avatar,
      coverPhoto,
      bio,
      status: status as EUserStatus,
      friends: [],
      acceptFriends: [],
      requestFriends: [],
      online: EUserOnline.offline,
      deleted: false
    });

    req.flash("success", "Người dùng được tạo thành công!");
    return res.redirect(`/${configs.admin}/users`);
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [GET] /admin/users/update/:id
const update = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("userUpdate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/users`);
    }

    const id: string = req.params.id;

    const userExists = await userService.findById(id);
    if (!userExists) {
      req.flash("error", "Người dùng không tồn tại!");
      return res.redirect("back");
    }

    return res.render("admin/pages/users/update", {
      pageTitle: "Cập Nhật Người Dùng",
      user: userExists
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [PATCH] /admin/users/update/:id
const updatePatch = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("userUpdate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/users`);
    }

    const id: string = req.params.id;

    const fullName: string = req.body.fullName;
    const slug: string = slugUtil.convert(fullName) + '-' + shortUniqueKeyUtil.generate();
    const email: string = req.body.email;
    const phone: string = req.body.phone;
    const status: string = req.body.status;
    const bio: string = req.body.bio;

    let avatar: string | undefined = undefined;
    if (req.files["avatar"]) {
      avatar = req.files["avatar"][0].path;
    }
    let coverPhoto: string | undefined = undefined;
    if (req.files["coverPhoto"]) {
      coverPhoto = req.files["coverPhoto"][0].path;
    }

    const [
      userIdExists,
      userSlugExists,
      userEmailExists,
      userPhoneExists,
    ] = await Promise.all([
      userService.findById(id),
      userService.findBySlug(slug),
      userService.findByEmail(email),
      userService.findByPhone(phone),
    ]);
    if (!userIdExists) {
      req.flash("error", "Người dùng không tồn tại!");
      return res.redirect("back");
    }
    if (userSlugExists) {
      req.flash("error", "Có lỗi xảy ra!");
      return res.redirect("back");
    }
    if (
      userEmailExists &&
      userEmailExists.id !== id
    ) {
      req.flash("error", "Email đã tồn tại!");
      return res.redirect("back");
    }
    if (
      userPhoneExists &&
      userPhoneExists.id !== id
    ) {
      req.flash("error", "Số điện thoại đã tồn tại!");
      return res.redirect("back");
    }

    await userService.update(id, {
      fullName,
      slug,
      email,
      phone,
      avatar,
      coverPhoto,
      bio,
      status: status as EUserStatus
    });
    req.flash("success", "Người dùng được cập nhật thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

// [PATCH] /admin/users/actions
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
        if (!myAccount.permissions.includes("userDelete")) {
          req.flash("error", "Bạn không có quyền!");
          return res.redirect(`/${configs.admin}/users`);
        }

        await Promise.all(ids.map(id => userService.del(id)));

        break;
      }

      case "active": {
        if (!myAccount.permissions.includes("userUpdate")) {
          req.flash("error", "Bạn không có quyền!");
          return res.redirect(`/${configs.admin}/users`);
        }

        await Promise.all(ids.map(id => userService.update(id, { status: EUserStatus.active })));

        break;
      }

      case "inactive": {
        if (!myAccount.permissions.includes("userUpdate")) {
          req.flash("error", "Bạn không có quyền!");
          return res.redirect(`/${configs.admin}/users`);
        }

        await Promise.all(ids.map(id => userService.update(id, { status: EUserStatus.inactive })));

        break;
      }

      default: {
        req.flash("error", "Hành động không chính xác!");
        return res.redirect("back");
      }
    }

    req.flash("success", "Các người dùng được cập nhật thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

// [PATCH] /admin/users/updateStatus/:status/:id
const updateStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("userUpdate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/users`);
    }

    const id: string = req.params.id;
    const status: string = req.params.status;

    const userExists = await userService.findById(id);
    if (!userExists) {
      req.flash("error", "Người dùng không tồn tại!");
      return res.redirect("back");
    }

    await userService.update(id, { status: status as EUserStatus });
    req.flash("success", "Người dùng được cập nhật thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

// [DELETE] /admin/users/delete/:id
const del = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("userDelete")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/users`);
    }

    const id: string = req.params.id;

    const userExists = await userService.findById(id);
    if (!userExists) {
      req.flash("error", "Người dùng không tồn tại!");
      return res.redirect("back");
    }

    await userService.del(id);
    req.flash("success", "Người dùng được xóa thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

const userController = {
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
export default userController;