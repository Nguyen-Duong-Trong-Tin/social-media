import { Response } from "express";

import configs from "../../configs/index.config";

import { EArticleGroupStatus } from "../../enums/articleGroup.enum";

import getUrlHelper from "../../helpers/getUrl.helper";

import groupService from "../../services/admin/group.service";
import articleGroupService from "../../services/admin/articleGroup.service";
import userService from "../../services/admin/user.service";

import slugUtil from "../../utils/slug.util";
import shortUniqueKeyUtil from "../../utils/shortUniqueKey.util";

// [GET] /admin/articleGroups?page=:page&limit=:limit&keyword=:keyword&sort=:sort&filter=:filter
const get = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("articleGroupView")) {
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
        { value: "title-asc", title: "Tiêu đề bài viết cộng đồng tăng dần" },
        { value: "title-desc", title: "Tiêu đề bài viết cộng đồng giảm dần" }
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

    const [maxPage, articleGroups] = await Promise.all([
      articleGroupService.calculateMaxPage(limit),
      articleGroupService.find(req)
    ]);
    const groups = await Promise.all(articleGroups.map(articleGroup => groupService.findById(articleGroup.groupId)));

    return res.render("admin/pages/articleGroups", {
      pageTitle: "Danh Sách Bài Viết Cộng Đồng",
      url: getUrlHelper(req),
      articleGroups,
      groups,
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

// [GET] /admin/articleGroups/detail/:id
const getById = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("articleGroupView")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/articleGroups`);
    }

    const id: string = req.params.id;

    const articleGroupExists = await articleGroupService.findById(id);
    if (!articleGroupExists) {
      req.flash("error", "Bài viểt cộng đồng không tồn tại!");
      return res.redirect("back");
    }

    const [
      users,
      groups
    ] = await Promise.all([
      userService.findAll(),
      groupService.findAll()
    ]);

    return res.render("admin/pages/articleGroups/detail", {
      pageTitle: "Chi Tiết Bài Viết Cộng Đồng",
      articleGroup: articleGroupExists,
      groups,
      users
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [GET] /admin/articleGroups/create
const create = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("articleGroupCreate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/articleGroups`);
    }

    const [
      users,
      groups
    ] = await Promise.all([
      userService.findAll(),
      groupService.findAll()
    ]);

    return res.render("admin/pages/articleGroups/create", {
      pageTitle: "Tạo Mới Bài Viết Cộng Đồng",
      users,
      groups
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [POST] /admin/articleGroups/create
const createPost = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("articleGroupCreate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/articleGroups`);
    }

    const title: string = req.body.title;
    const slug: string = slugUtil.convert(title) + '-' + shortUniqueKeyUtil.generate();
    const description: string = req.body.description;

    const images: string[] = req.files["images"];
    const videos: string[] = req.files["videos"];
    const status: EArticleGroupStatus = req.body.status;
    const userId: string = req.body.userId;
    const groupId: string = req.body.groupId;

    const [
      articleGroupSlugExists,
      userExists,
      groupExists
    ] = await Promise.all([
      articleGroupService.findBySlug(slug),
      userService.findById(userId),
      groupService.findById(groupId)
    ]);
    if (articleGroupSlugExists) {
      req.flash("error", "Có lỗi xảy ra!");
      return res.redirect("back");
    }
    if (!userExists) {
      req.flash("error", "Người dùng không tồn tại!");
      return res.redirect("back");
    }
    if (!groupExists) {
      req.flash("error", "Cộng đồng không tồn tại!");
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

    await articleGroupService.create({
      title,
      slug,
      description,
      images: imagePaths,
      videos: videoPaths,
      status,
      groupId,
      createdBy,
      deleted: false
    });
    req.flash("success", "Bài viết cộng đồng được tạo thành công!");
    return res.redirect(`/${configs.admin}/articleGroups`);
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [GET] /admin/articleGroups/update/:id
const update = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("articleGroupUpdate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/articleGroups`);
    }

    const id: string = req.params.id;

    const articleGroupExists = await articleGroupService.findById(id);
    if (!articleGroupExists) {
      req.flash("error", "Bài viểt cộng đồng không tồn tại!");
      return res.redirect("back");
    }

    const [
      users,
      groups
    ] = await Promise.all([
      userService.findAll(),
      groupService.findAll()
    ]);

    return res.render("admin/pages/articleGroups/update", {
      pageTitle: "Cập Nhật Bài Viết Cộng Đồng",
      articleGroup: articleGroupExists,
      groups,
      users
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [POST] /admin/articleGroups/update/:id
const updatePatch = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("articleGroupUpdate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/articleGroups`);
    }

    const id: string = req.params.id;

    const title: string = req.body.title;
    const slug: string = slugUtil.convert(title) + '-' + shortUniqueKeyUtil.generate();
    const description: string = req.body.description;

    const images: string[] = req.files["images"];
    const videos: string[] = req.files["videos"];
    const status: EArticleGroupStatus = req.body.status;
    const userId: string = req.body.userId;
    const groupId: string = req.body.groupId;

    const [
      articleGroupExists,
      articleGroupSlugExists,
      userExists,
      groupExists
    ] = await Promise.all([
      articleGroupService.findById(id),
      articleGroupService.findBySlug(slug),
      userService.findById(userId),
      groupService.findById(groupId)
    ]);
    if (!articleGroupExists) {
      req.flash("error", "Bài viết cộng đồng không tồn tại!");
      return res.redirect("back");
    }
    if (articleGroupSlugExists) {
      req.flash("error", "Có lỗi xảy ra!");
      return res.redirect("back");
    }
    if (!userExists) {
      req.flash("error", "Người dùng không tồn tại!");
      return res.redirect("back");
    }
    if (!groupExists) {
      req.flash("error", "Cộng đồng không tồn tại!");
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

    await articleGroupService.update(id, {
      title,
      slug,
      description,
      images: images ? imagePaths : undefined,
      videos: videos ? videoPaths : undefined,
      status,
      groupId,
      createdBy,
      deleted: false
    });
    req.flash("success", "Bài viết cộng đồng được cập nhật thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

// [PATCH] /admin/articleGroups/actions
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
        if (!myAccount.permissions.includes("articleGroupDelete")) {
          req.flash("error", "Bạn không có quyền!");
          return res.redirect(`/${configs.admin}/articleGroups`);
        }

        await Promise.all(ids.map(id => articleGroupService.del(id)));

        break;
      }

      case "active": {
        if (!myAccount.permissions.includes("articleGroupUpdate")) {
          req.flash("error", "Bạn không có quyền!");
          return res.redirect(`/${configs.admin}/articleGroups`);
        }

        await Promise.all(ids.map(id => articleGroupService.update(id, { status: EArticleGroupStatus.active })));

        break;
      }

      case "inactive": {
        if (!myAccount.permissions.includes("articleGroupUpdate")) {
          req.flash("error", "Bạn không có quyền!");
          return res.redirect(`/${configs.admin}/articleGroups`);
        }

        await Promise.all(ids.map(id => articleGroupService.update(id, { status: EArticleGroupStatus.inactive })));

        break;
      }

      default: {
        req.flash("error", "Hành động không chính xác!");
        return res.redirect("back");
      }
    }

    req.flash("success", "Các cộng đồng được cập nhật thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

// [PATCH] /admin/articleGroups/updateStatus/:status/:id
const updateStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("articleGroupUpdate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/articleGroups`);
    }

    const id: string = req.params.id;
    const status: EArticleGroupStatus = req.params.status;

    const articleGroupExists = await articleGroupService.findById(id);
    if (!articleGroupExists) {
      req.flash("error", "Bài viết cộng đồng không tồn tại!");
      return res.redirect("back");
    }

    await articleGroupService.update(id, { status });
    req.flash("success", "Bài viết cộng đồng được cập nhật thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

// [DELETE] /admin/articleGroups/delete/:id
const del = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("articleGroupDelete")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/articleGroups`);
    }

    const id: string = req.params.id;

    const articleGroupExists = await articleGroupService.findById(id);
    if (!articleGroupExists) {
      req.flash("error", "Bài viết cộng đồng không tồn tại!");
      return res.redirect("back");
    }

    await articleGroupService.del(id);
    req.flash("success", "Bài viết cộng đồng được xóa thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

const articleGroupController = {
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
export default articleGroupController;