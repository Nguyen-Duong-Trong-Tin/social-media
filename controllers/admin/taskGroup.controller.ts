import { Response } from "express";

import configs from "../../configs/index.config";

import { ETaskGroupStatus } from "../../enums/taskGroup.enum";

import getUrlHelper from "../../helpers/getUrl.helper";

import groupService from "../../services/admin/group.service";
import taskGroupService from "../../services/admin/taskGroup.service";
import userService from "../../services/admin/user.service";

import slugUtil from "../../utils/slug.util";
import shortUniqueKeyUtil from "../../utils/shortUniqueKey.util";

// [GET] /admin/taskGroups?page=:page&limit=:limit&keyword=:keyword&sort=:sort&filter=:filter
const get = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("taskGroupView")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/dashboard`);
    }

    const filter: string = req.query.filter;
    const filterOptions: {
      value: string;
      title: string;
    }[] = [
      { value: "", title: "---" },
      { value: "status-active", title: "Trạng thái hoạt động" },
      { value: "status-inactive", title: "Trạng thái ngưng hoạt động" },
    ];

    const sort: string = req.query.sort;
    const sortOptions: {
      value: string;
      title: string;
    }[] = [
      { value: "", title: "---" },
      { value: "title-asc", title: "Tiêu đề nhiệm vụ cộng đồng tăng dần" },
      { value: "title-desc", title: "Tiêu đề nhiệm vụ cộng đồng giảm dần" },
    ];

    const keyword: string = req.query.keyword;

    const actionOptions: {
      value: string;
      title: string;
    }[] = [
      { value: "", title: "---" },
      { value: "delete", title: "Xóa" },
      { value: "active", title: "Hoạt động" },
      { value: "inactive", title: "Ngưng hoạt động" },
    ];

    const page: number = parseInt(req.query.page as string) || 1;
    const limit: number = parseInt(req.query.limit as string) || 10;

    const [maxPage, taskGroups] = await Promise.all([
      taskGroupService.calculateMaxPage(limit),
      taskGroupService.find(req),
    ]);
    const groups = await Promise.all(
      taskGroups.map((taskGroup) => groupService.findById(taskGroup.groupId))
    );

    return res.render("admin/pages/taskGroups", {
      pageTitle: "Danh Sách Nhiệm Vụ Cộng Đồng",
      url: getUrlHelper(req),
      taskGroups,
      groups,
      filter: {
        filter,
        filterOptions,
      },
      sort: {
        sort,
        sortOptions,
      },
      keyword,
      actionOptions,
      pagination: {
        page,
        limit,
        maxPage,
      },
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
};

// [GET] /admin/taskGroups/detail/:id
const getById = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("taskGroupView")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/taskGroups`);
    }

    const id: string = req.params.id;

    const taskGroupExists = await taskGroupService.findById(id);
    if (!taskGroupExists) {
      req.flash("error", "Bài viểt cộng đồng không tồn tại!");
      return res.redirect("back");
    }

    const [users, groups] = await Promise.all([
      userService.findAll(),
      groupService.findAll(),
    ]);

    return res.render("admin/pages/taskGroups/detail", {
      pageTitle: "Chi Tiết Nhiệm Vụ Cộng Đồng",
      taskGroup: taskGroupExists,
      groups,
      users,
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
};

// [GET] /admin/taskGroups/create
const create = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("taskGroupCreate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/taskGroups`);
    }

    const [users, groups] = await Promise.all([
      userService.findAll(),
      groupService.findAll(),
    ]);

    return res.render("admin/pages/taskGroups/create", {
      pageTitle: "Tạo Mới Nhiệm Vụ Cộng Đồng",
      users,
      groups,
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
};

// [POST] /admin/taskGroups/create
const createPost = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("taskGroupCreate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/taskGroups`);
    }

    const title: string = req.body.title;
    const slug: string =
      slugUtil.convert(title) + "-" + shortUniqueKeyUtil.generate();
    const description: string = req.body.description;

    const images: string[] = req.files["images"];
    const videos: string[] = req.files["videos"];
    const status: ETaskGroupStatus = req.body.status;
    const userId: string = req.body.userId;
    const groupId: string = req.body.groupId;

    const [taskGroupSlugExists, userExists, groupExists] = await Promise.all([
      taskGroupService.findBySlug(slug),
      userService.findById(userId),
      groupService.findById(groupId),
    ]);
    if (taskGroupSlugExists) {
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
      createdAt: new Date(),
    };
    const imagePaths = (images || []).map((image) => (image as any).path);
    const videoPaths = (videos || []).map((video) => (video as any).path);

    await taskGroupService.create({
      title,
      slug,
      description,
      images: imagePaths,
      videos: videoPaths,
      status,
      groupId,
      createdBy,
      deleted: false,
    });
    req.flash("success", "Nhiệm vụ cộng đồng được tạo thành công!");
    return res.redirect(`/${configs.admin}/taskGroups`);
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
};

// [GET] /admin/taskGroups/update/:id
const update = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("taskGroupUpdate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/taskGroups`);
    }

    const id: string = req.params.id;

    const taskGroupExists = await taskGroupService.findById(id);
    if (!taskGroupExists) {
      req.flash("error", "Bài viểt cộng đồng không tồn tại!");
      return res.redirect("back");
    }

    const [users, groups] = await Promise.all([
      userService.findAll(),
      groupService.findAll(),
    ]);

    return res.render("admin/pages/taskGroups/update", {
      pageTitle: "Cập Nhật Nhiệm Vụ Cộng Đồng",
      taskGroup: taskGroupExists,
      groups,
      users,
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
};

// [PATCH] /admin/taskGroups/update/:id
const updatePatch = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("taskGroupUpdate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/taskGroups`);
    }

    const id: string = req.params.id;

    const title: string = req.body.title;
    const slug: string =
      slugUtil.convert(title) + "-" + shortUniqueKeyUtil.generate();
    const description: string = req.body.description;

    const images: string[] = req.files["images"];
    const videos: string[] = req.files["videos"];
    const status: ETaskGroupStatus = req.body.status;
    const userId: string = req.body.userId;
    const groupId: string = req.body.groupId;

    const [taskGroupExists, taskGroupSlugExists, userExists, groupExists] =
      await Promise.all([
        taskGroupService.findById(id),
        taskGroupService.findBySlug(slug),
        userService.findById(userId),
        groupService.findById(groupId),
      ]);
    if (!taskGroupExists) {
      req.flash("error", "Nhiệm Vụ cộng đồng không tồn tại!");
      return res.redirect("back");
    }
    if (taskGroupSlugExists) {
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
      createdAt: new Date(),
    };
    const imagePaths = (images || []).map((image) => (image as any).path);
    const videoPaths = (videos || []).map((video) => (video as any).path);

    await taskGroupService.update(id, {
      title,
      slug,
      description,
      images: images ? imagePaths : undefined,
      videos: videos ? videoPaths : undefined,
      status,
      groupId,
      createdBy,
      deleted: false,
    });
    req.flash("success", "Nhiệm Vụ cộng đồng được cập nhật thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
};

// [PATCH] /admin/taskGroups/actions
const actions = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    const action: string = req.body.action;
    const ids: string[] = req.body.ids.split(",");

    switch (action) {
      case "delete": {
        if (!myAccount.permissions.includes("taskGroupDelete")) {
          req.flash("error", "Bạn không có quyền!");
          return res.redirect(`/${configs.admin}/taskGroups`);
        }

        await Promise.all(ids.map((id) => taskGroupService.del(id)));

        break;
      }

      case "active": {
        if (!myAccount.permissions.includes("taskGroupUpdate")) {
          req.flash("error", "Bạn không có quyền!");
          return res.redirect(`/${configs.admin}/taskGroups`);
        }

        await Promise.all(
          ids.map((id) =>
            taskGroupService.update(id, { status: ETaskGroupStatus.active })
          )
        );

        break;
      }

      case "inactive": {
        if (!myAccount.permissions.includes("taskGroupUpdate")) {
          req.flash("error", "Bạn không có quyền!");
          return res.redirect(`/${configs.admin}/taskGroups`);
        }

        await Promise.all(
          ids.map((id) =>
            taskGroupService.update(id, { status: ETaskGroupStatus.inactive })
          )
        );

        break;
      }

      default: {
        req.flash("error", "Hành động không chính xác!");
        return res.redirect("back");
      }
    }

    req.flash("success", "Các nhiệm vụ cộng đồng được cập nhật thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
};

// [PATCH] /admin/taskGroups/updateStatus/:status/:id
const updateStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("taskGroupUpdate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/taskGroups`);
    }

    const id: string = req.params.id;
    const status: ETaskGroupStatus = req.params.status;

    const taskGroupExists = await taskGroupService.findById(id);
    if (!taskGroupExists) {
      req.flash("error", "Nhiệm vụ cộng đồng không tồn tại!");
      return res.redirect("back");
    }

    await taskGroupService.update(id, { status });
    req.flash("success", "Nhiệm vụ cộng đồng được cập nhật thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
};

// [DELETE] /admin/taskGroups/delete/:id
const del = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("taskGroupDelete")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/taskGroups`);
    }

    const id: string = req.params.id;

    const taskGroupExists = await taskGroupService.findById(id);
    if (!taskGroupExists) {
      req.flash("error", "Nhiệm vụ cộng đồng không tồn tại!");
      return res.redirect("back");
    }

    await taskGroupService.del(id);
    req.flash("success", "Nhiệm vụ cộng đồng được xóa thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
};

const taskGroupController = {
  get,
  getById,
  create,
  createPost,
  update,
  updatePatch,
  actions,
  updateStatus,
  del,
};
export default taskGroupController;
