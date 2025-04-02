import { Response } from "express";

import configs from "../../configs/index.config";

import { EArticleUserStatus } from "../../enums/articleUser.enum";

import getUrlHelper from "../../helpers/getUrl.helper";

import articleUserService from "../../services/admin/articleUser.service";
import userService from "../../services/admin/user.service";

import slugUtil from "../../utils/slug.util";
import shortUniqueKeyUtil from "../../utils/shortUniqueKey.util";

// [GET] /admin/articleUsers?page=:page&limit=:limit&keyword=:keyword&sort=:sort&filter=:filter
const get = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("articleUserView")) {
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
        { value: "title-asc", title: "Tiêu đề bài viết người dùng tăng dần" },
        { value: "title-desc", title: "Tiêu đề bài viết người dùng giảm dần" }
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

    const [maxPage, articleUsers] = await Promise.all([
      articleUserService.calculateMaxPage(limit),
      articleUserService.find(req)
    ]);
    const users = await Promise.all(articleUsers.map(articleUser => userService.findById(articleUser.createdBy.userId as string)));

    return res.render("admin/pages/articleUsers", {
      pageTitle: "Danh Sách Bài Viết Người Dùng",
      url: getUrlHelper(req),
      articleUsers,
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

// [GET] /admin/articleUsers/detail/:id
const getById = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("articleUserView")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/articleUsers`);
    }

    const id: string = req.params.id;

    const articleUserExists = await articleUserService.findById(id);
    if (!articleUserExists) {
      req.flash("error", "Bài viểt người dùng không tồn tại!");
      return res.redirect("back");
    }

    const users = await userService.findAll();

    return res.render("admin/pages/articleUsers/detail", {
      pageTitle: "Chi Tiết Bài Viết Người Dùng",
      articleUser: articleUserExists,
      users
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [GET] /admin/articleUsers/create
const create = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("articleUserCreate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/articleUsers`);
    }

    const users = await userService.findAll();
    return res.render("admin/pages/articleUsers/create", {
      pageTitle: "Tạo Mới Bài Viết Người Dùng",
      users
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [POST] /admin/articleUsers/create
const createPost = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("articleUserCreate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/articleUsers`);
    }

    const title: string = req.body.title;
    const slug: string = slugUtil.convert(title) + '-' + shortUniqueKeyUtil.generate();
    const description: string = req.body.description;

    const images: string[] = req.files["images"];
    const videos: string[] = req.files["videos"];
    const status: EArticleUserStatus = req.body.status;
    const userId: string = req.body.userId;

    const [
      articleUserSlugExists,
      userExists
    ] = await Promise.all([
      articleUserService.findBySlug(slug),
      userService.findById(userId)
    ]);
    if (articleUserSlugExists) {
      req.flash("error", "Có lỗi xảy ra!");
      return res.redirect("back");
    }
    if (!userExists) {
      req.flash("error", "Người dùng không tồn tại!");
      return res.redirect("back");
    }

    const createdBy: {
      userId: string;
      createdAt: Date;
    } = {
      userId,
      createdAt: new Date()
    };
    const imagePaths = (images || []).map(image => (image as any).path);
    const videoPaths = (videos || []).map(video => (video as any).path);

    await articleUserService.create({
      title,
      slug,
      description,
      images: imagePaths,
      videos: videoPaths,
      status,
      createdBy,
      deleted: false
    });
    req.flash("success", "Bài viết người dùng được tạo thành công!");
    return res.redirect(`/${configs.admin}/articleUsers`);
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [GET] /admin/articleUsers/update/:id
const update = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("articleUserUpdate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/articleUsers`);
    }

    const id: string = req.params.id;

    const articleUserExists = await articleUserService.findById(id);
    if (!articleUserExists) {
      req.flash("error", "Bài viểt người dùng không tồn tại!");
      return res.redirect("back");
    }

    const users = await userService.findAll();
    return res.render("admin/pages/articleUsers/update", {
      pageTitle: "Cập Nhật Bài Viết Người Dùng",
      articleUser: articleUserExists,
      users
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [PATCH] /admin/articleUsers/update/:id
const updatePatch = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("articleUserUpdate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/articleUsers`);
    }

    const id: string = req.params.id;

    const title: string = req.body.title;
    const slug: string = slugUtil.convert(title) + '-' + shortUniqueKeyUtil.generate();
    const description: string = req.body.description;

    const images: string[] = req.files["images"];
    const videos: string[] = req.files["videos"];
    const status: EArticleUserStatus = req.body.status;
    const userId: string = req.body.userId;

    const [
      articleUserExists,
      articleUserSlugExists,
      userExists
    ] = await Promise.all([
      articleUserService.findById(id),
      articleUserService.findBySlug(slug),
      userService.findById(userId)
    ]);
    if (!articleUserExists) {
      req.flash("error", "Bài viết người dùng không tồn tại!");
      return res.redirect("back");
    }
    if (articleUserSlugExists) {
      req.flash("error", "Có lỗi xảy ra!");
      return res.redirect("back");
    }
    if (!userExists) {
      req.flash("error", "Người dùng không tồn tại!");
      return res.redirect("back");
    }

    const createdBy: {
      userId: string;
      createdAt: Date;
    } = {
      userId,
      createdAt: new Date()
    };
    const imagePaths = (images || []).map(image => (image as any).path);
    const videoPaths = (videos || []).map(video => (video as any).path);

    await articleUserService.update(id, {
      title,
      slug,
      description,
      images: images ? imagePaths : undefined,
      videos: videos ? videoPaths : undefined,
      status,
      createdBy,
      deleted: false
    });
    req.flash("success", "Bài viết người dùng được cập nhật thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

// [PATCH] /admin/articleUsers/actions
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
        if (!myAccount.permissions.includes("articleUserDelete")) {
          req.flash("error", "Bạn không có quyền!");
          return res.redirect(`/${configs.admin}/articleUsers`);
        }

        await Promise.all(ids.map(id => articleUserService.del(id)));

        break;
      }

      case "active": {
        if (!myAccount.permissions.includes("articleUserUpdate")) {
          req.flash("error", "Bạn không có quyền!");
          return res.redirect(`/${configs.admin}/articleUsers`);
        }

        await Promise.all(ids.map(id => articleUserService.update(id, { status: EArticleUserStatus.active })));

        break;
      }

      case "inactive": {
        if (!myAccount.permissions.includes("articleUserUpdate")) {
          req.flash("error", "Bạn không có quyền!");
          return res.redirect(`/${configs.admin}/articleUsers`);
        }

        await Promise.all(ids.map(id => articleUserService.update(id, { status: EArticleUserStatus.inactive })));

        break;
      }

      default: {
        req.flash("error", "Hành động không chính xác!");
        return res.redirect("back");
      }
    }

    req.flash("success", "Các bài viết người dùng được cập nhật thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

// [PATCH] /admin/articleUsers/updateStatus/:status/:id
const updateStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("articleUserUpdate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/articleUsers`);
    }

    const id: string = req.params.id;
    const status: EArticleUserStatus = req.params.status;

    const articleUserExists = await articleUserService.findById(id);
    if (!articleUserExists) {
      req.flash("error", "Bài viết người dùng không tồn tại!");
      return res.redirect("back");
    }

    await articleUserService.update(id, { status });
    req.flash("success", "Bài viết người dùng được cập nhật thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

// [DELETE] /admin/articleUsers/delete/:id
const del = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("articleUserDelete")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/articleUsers`);
    }

    const id: string = req.params.id;

    const articleUserExists = await articleUserService.findById(id);
    if (!articleUserExists) {
      req.flash("error", "Bài viết người dùng không tồn tại!");
      return res.redirect("back");
    }

    await articleUserService.del(id);
    req.flash("success", "Bài viết người dùng được xóa thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

const articleUserController = {
  get,
  getById,
  create,
  createPost,
  update,
  actions,
  updatePatch,
  updateStatus,
  del
};
export default articleUserController;