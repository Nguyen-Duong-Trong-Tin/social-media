import { Response } from "express";

import configs from "../../configs/index.config";

import getUrlHelper from "../../helpers/getUrl.helper";

import groupTopicService from "../../services/admin/groupTopic.service";

import slugUtil from "../../utils/slug.util";
import shortUniqueKeyUtil from "../../utils/shortUniqueKey.util";

// [GET] /admin/groupTopics
const get = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("groupTopicView")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/dashboard`);
    }

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

    const [maxPage, groupTopics] = await Promise.all([
      groupTopicService.calculateMaxPage(limit),
      groupTopicService.find(req)
    ]);

    return res.render("admin/pages/groupTopics", {
      pageTitle: "Danh Sách Chủ Đề Cộng Đồng",
      url: getUrlHelper(req),
      groupTopics,
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

// [GET] /admin/groupTopics/detail/:id
const getById = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("groupTopicView")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/dashboard`);
    }

    const id: string = req.params.id;

    const groupTopicExists = await groupTopicService.findById(id);
    if (!groupTopicExists) {
      req.flash("error", "Chủ đề cộng đồng không tồn tại!");
      return res.redirect("back");
    }

    return res.render("admin/pages/groupTopics/detail", {
      pageTitle: "Chi Tiết Chủ Đề Cộng Đồng",
      groupTopic: groupTopicExists
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [GET] /admin/groupTopics/create
const create = (req: any, res: Response): void => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("groupTopicCreate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/groupTopics`);
    }

    return res.render("admin/pages/groupTopics/create", {
      pageTitle: "Tạo Mới Chủ Đề Cộng Đồng",
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [POST] /admin/groupTopics/create
const createPost = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("groupTopicCreate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/groupTopics`);
    }

    const title: string = req.body.title;
    const slug: string = slugUtil.convert(title) + '-' + shortUniqueKeyUtil.generate();
    const description: string = req.body.description;

    const groupTopicSlugExists = await groupTopicService.findBySlug(slug);
    if (groupTopicSlugExists) {
      req.flash("error", "Có lỗi xảy ra!");
      return res.redirect("back");
    }

    await groupTopicService.create({
      title,
      slug,
      description,
      deleted: false
    });
    req.flash("success", "Chủ đề cộng đồng được tạo thành công!");
    return res.redirect(`/${configs.admin}/groupTopics`);
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [GET] /admin/groupTopics/update/:id
const update = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("groupTopicUpdate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/groupTopics`);
    }

    const id: string = req.params.id;

    const groupTopicExists = await groupTopicService.findById(id);
    if (!groupTopicExists) {
      req.flash("error", "Chủ đề cộng đồng không tồn tại!");
      return res.redirect("back");
    }

    return res.render("admin/pages/groupTopics/update", {
      pageTitle: "Cập Nhật Chủ Đề Cộng Đồng",
      groupTopic: groupTopicExists
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [PATCH] /admin/groupTopics/update/:id
const updatePatch = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("groupTopicUpdate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/groupTopics`);
    }

    const id: string = req.params.id;

    const title: string = req.body.title;
    const slug: string = slugUtil.convert(title) + '-' + shortUniqueKeyUtil.generate();
    const description: string = req.body.description;

    const [
      groupTopicIdExists,
      groupTopicSlugExists
    ] = await Promise.all([
      groupTopicService.findById(id),
      groupTopicService.findBySlug(slug),
    ]);
    if (!groupTopicIdExists) {
      req.flash("error", "Chủ đề cộng đồng không tồn tại!");
      return res.redirect("back");
    }
    if (groupTopicSlugExists) {
      req.flash("error", "Có lỗi xảy ra!");
      return res.redirect("back");
    }

    await groupTopicService.update(id, {
      title,
      slug,
      description
    });
    req.flash("success", "Chủ đề cộng đồng được cập nhật thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

// [PATCH] /admin/groupTopics/actions
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
        if (!myAccount.permissions.includes("groupTopicDelete")) {
          req.flash("error", "Bạn không có quyền!");
          return res.redirect(`/${configs.admin}/groupTopics`);
        }

        await Promise.all(ids.map(id => groupTopicService.del(id)));

        break;
      }

      default: {
        req.flash("error", "Hành động không chính xác!");
        return res.redirect("back");
      }
    }

    req.flash("success", "Các chủ đề cộng đồng được cập nhật thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

// [DELETE] /admin/groupTopics/delete/:id
const del = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("groupTopicDelete")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/groupTopics`);
    }

    const id: string = req.params.id;

    const groupTopicExists = await groupTopicService.findById(id);
    if (!groupTopicExists) {
      req.flash("error", "Chủ đề cộng đồng không tồn tại!");
      return res.redirect("back");
    }

    await groupTopicService.del(id);
    req.flash("success", "Chủ đề cộng đồng được xóa thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

const groupTopicController = {
  get,
  getById,
  create,
  createPost,
  update,
  updatePatch,
  actions,
  del
};
export default groupTopicController;