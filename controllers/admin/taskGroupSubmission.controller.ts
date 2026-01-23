import { Response } from "express";

import configs from "../../configs/index.config";

import { ETaskGroupSubmissionStatus } from "../../enums/taskGroupSubmission.enum";

import getUrlHelper from "../../helpers/getUrl.helper";

import userService from "../../services/admin/user.service";
import taskGroupService from "../../services/admin/taskGroup.service";
import taskGroupSubmissionService from "../../services/admin/taskGroupSubmission.service";

import slugUtil from "../../utils/slug.util";
import shortUniqueKeyUtil from "../../utils/shortUniqueKey.util";

// [GET] /admin/taskGroupSubmissions?page=:page&limit=:limit&keyword=:keyword&sort=:sort&filter=:filter
const get = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("taskGroupSubmissionView")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/dashboard`);
    }

    const filter: string = req.query.filter;
    const filterOptions: {
      value: string;
      title: string;
    }[] = [
        { value: "", title: "---" },
        { value: "status-active", title: "Active status" },
        { value: "status-inactive", title: "Inative status" },
      ];

    const sort: string = req.query.sort;
    const sortOptions: {
      value: string;
      title: string;
    }[] = [
        { value: "", title: "---" },
        { value: "title-asc", title: "Title (A - Z)" },
        { value: "title-desc", title: "Title (Z - A)" },
      ];

    const keyword: string = req.query.keyword;

    const actionOptions: {
      value: string;
      title: string;
    }[] = [
        { value: "", title: "---" },
        { value: "delete", title: "Delete" },
        { value: "active", title: "Active" },
        { value: "inactive", title: "Inactive" },
      ];

    const page: number = parseInt(req.query.page as string) || 1;
    const limit: number = parseInt(req.query.limit as string) || 10;

    const [maxPage, taskGroupSubmissions] = await Promise.all([
      taskGroupSubmissionService.calculateMaxPage(limit),
      taskGroupSubmissionService.find(req),
    ]);
    const taskGroups = await Promise.all(
      taskGroupSubmissions.map((taskGroupSubmission) => taskGroupService.findById(taskGroupSubmission.taskGroupId))
    );

    return res.render("admin/pages/taskGroupSubmissions", {
      pageTitle: "List of group task submissions",
      url: getUrlHelper(req),
      taskGroupSubmissions,
      taskGroups,
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
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
};

// [GET] /admin/taskGroupSubmissions/detail/:id
const getById = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("taskGroupSubmissionView")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/taskGroupSubmissions`);
    }

    const id: string = req.params.id;

    const taskGroupSubmissionExists = await taskGroupSubmissionService.findById(id);
    if (!taskGroupSubmissionExists) {
      req.flash("error", "Group task submission not found!");
      return res.redirect("back");
    }

    const [users, taskGroups] = await Promise.all([
      userService.findAll(),
      taskGroupService.findAll(),
    ]);

    return res.render("admin/pages/taskGroupSubmissions/detail", {
      pageTitle: "Group task submission details",
      taskGroupSubmission: taskGroupSubmissionExists,
      taskGroups,
      users,
    });
  } catch {
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
};

// [GET] /admin/taskGroupSubmissions/materials/:id
const watchMaterials = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("taskGroupSubmissionView")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/taskGroupSubmissions`);
    }

    const id = req.params.id;

    const taskGroupSubmissionExists = await taskGroupSubmissionService.findById(id);
    if (!taskGroupSubmissionExists) {
      req.flash("error", "Group task submission not found!");
      return req.redirect("back");
    }

    const materialPDFs = [];
    const materialDOCs = [];
    for (const material of taskGroupSubmissionExists.materials) {
      const array = material.split('.');
      const extension = array[array.length - 1];

      if (extension === "pdf") {
        materialPDFs.push(material);
      } else {
        materialDOCs.push(material);
      }
    }

    return res.render("admin/pages/taskGroupSubmissions/materials", {
      pageTitle: "Materials of group task submission",
      taskGroupSubmission: taskGroupSubmissionExists,
      materialPDFs,
      materialDOCs
    })
  } catch {
    req.flash("error", "Something went wrong!");
    res.redirect("back");
  }
}

// [GET] /admin/taskGroupSubmissions/create
const create = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("taskGroupSubmissionCreate")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/taskGroupSubmissions`);
    }

    const [users, taskGroups] = await Promise.all([
      userService.findAll(),
      taskGroupService.findAll(),
    ]);

    return res.render("admin/pages/taskGroupSubmissions/create", {
      pageTitle: "Create new group task submission",
      users,
      taskGroups,
    });
  } catch {
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
};

// [POST] /admin/taskGroupSubmissions/create
const createPost = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("taskGroupSubmissionCreate")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/taskGroupSubmissions`);
    }

    const title: string = req.body.title;
    const slug: string = slugUtil.convert(title) + "-" + shortUniqueKeyUtil.generate();
    const description: string = req.body.description;

    const images: string[] = req.files["images"];
    const videos: string[] = req.files["videos"];
    const materials: string[] = req.files["materials"];
    const status: ETaskGroupSubmissionStatus = req.body.status;
    const userId: string = req.body.userId;
    const taskGroupId: string = req.body.taskGroupId;

    const [taskGroupSubmissionSlugExists, userExists, taskGroupExists] = await Promise.all([
      taskGroupSubmissionService.findBySlug(slug),
      userService.findById(userId),
      taskGroupService.findById(taskGroupId),
    ]);
    if (taskGroupSubmissionSlugExists) {
      req.flash("error", "Something went wrong!");
      return res.redirect("back");
    }
    if (!userExists) {
      req.flash("error", "User not found!");
      return res.redirect("back");
    }
    if (!taskGroupExists) {
      req.flash("error", "Group task not found!");
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
    const materialPaths = (materials || []).map((material) => (material as any).path);

    await taskGroupSubmissionService.create({
      title,
      slug,
      description,
      images: imagePaths,
      videos: videoPaths,
      materials: materialPaths,
      status,
      taskGroupId,
      createdBy,
      deleted: false,
    });
    req.flash("success", "Group task submission was created successfully!");
    return res.redirect(`/${configs.admin}/taskGroupSubmissions`);
  } catch {
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
};

// [GET] /admin/taskGroupSubmissions/update/:id
const update = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("taskGroupSubmissionUpdate")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/taskGroupSubmissions`);
    }

    const id: string = req.params.id;

    const taskGroupSubmissionExists = await taskGroupSubmissionService.findById(id);
    if (!taskGroupSubmissionExists) {
      req.flash("error", "Group task submission not found");
      return res.redirect("back");
    }

    const [users, taskGroups] = await Promise.all([
      userService.findAll(),
      taskGroupService.findAll(),
    ]);

    return res.render("admin/pages/taskGroupSubmissions/update", {
      pageTitle: "Update group task submission",
      taskGroupSubmission: taskGroupSubmissionExists,
      taskGroups,
      users,
    });
  } catch {
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
};

// [PATCH] /admin/taskGroupSubmissions/update/:id
const updatePatch = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("taskGroupSubmissionUpdate")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/taskGroupSubmissions`);
    }

    const id: string = req.params.id;

    const title: string = req.body.title;
    const slug: string = slugUtil.convert(title) + "-" + shortUniqueKeyUtil.generate();
    const description: string = req.body.description;

    const images: string[] = req.files["images"];
    const videos: string[] = req.files["videos"];
    const materials: string[] = req.files["materials"];
    const status: ETaskGroupSubmissionStatus = req.body.status;
    const userId: string = req.body.userId;
    const taskGroupId: string = req.body.taskGroupId;

    const [
      taskGroupSubmissionExists,
      taskGroupSubmissionSlugExists,
      userExists,
      taskGroupExists
    ] = await Promise.all([
      taskGroupSubmissionService.findById(id),
      taskGroupSubmissionService.findBySlug(slug),
      userService.findById(userId),
      taskGroupService.findById(taskGroupId),
    ]);
    if (!taskGroupSubmissionExists) {
      req.flash("error", "Group task submission not found");
      return res.redirect("back");
    }
    if (taskGroupSubmissionSlugExists) {
      req.flash("error", "Something went wrong!");
      return res.redirect("back");
    }
    if (!userExists) {
      req.flash("error", "User not found!");
      return res.redirect("back");
    }
    if (!taskGroupExists) {
      req.flash("error", "Group not found!");
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
    const materialPaths = (materials || []).map((material) => (material as any).path);

    await taskGroupSubmissionService.update(id, {
      title,
      slug,
      description,
      images: images ? imagePaths : undefined,
      videos: videos ? videoPaths : undefined,
      materials: materials ? materialPaths : undefined,
      status,
      taskGroupId,
      createdBy,
      deleted: false,
    });
    req.flash("success", "Group task submission was updated successfully!");
  } catch {
    req.flash("error", "Something went wrong!");
  }
  return res.redirect("back");
};

// [PATCH] /admin/taskGroupSubmissions/actions
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
        if (!myAccount.permissions.includes("taskGroupSubmissionDelete")) {
          req.flash("error", "Access denied!");
          return res.redirect(`/${configs.admin}/taskGroupSubmissions`);
        }

        await Promise.all(ids.map((id) => taskGroupSubmissionService.del(id)));

        break;
      }

      case "active": {
        if (!myAccount.permissions.includes("taskGroupSubmissionUpdate")) {
          req.flash("error", "Access denied!");
          return res.redirect(`/${configs.admin}/taskGroupSubmissions`);
        }

        await Promise.all(
          ids.map((id) =>
            taskGroupSubmissionService.update(id, { status: ETaskGroupSubmissionStatus.active })
          )
        );

        break;
      }

      case "inactive": {
        if (!myAccount.permissions.includes("taskGroupSubmissionUpdate")) {
          req.flash("error", "Access denied!");
          return res.redirect(`/${configs.admin}/taskGroupSubmissions`);
        }

        await Promise.all(
          ids.map((id) =>
            taskGroupSubmissionService.update(id, { status: ETaskGroupSubmissionStatus.inactive })
          )
        );

        break;
      }

      default: {
        req.flash("error", "Action wrong!");
        return res.redirect("back");
      }
    }

    req.flash("success", "Group task submissions were updated successfully!");
  } catch {
    req.flash("error", "Something went wrong!");
  }
  return res.redirect("back");
};

// [PATCH] /admin/taskGroupSubmissions/updateStatus/:status/:id
const updateStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("taskGroupSubmissionUpdate")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/taskGroupSubmissions`);
    }

    const id: string = req.params.id;
    const status: ETaskGroupSubmissionStatus = req.params.status;

    const taskGroupSubmissionExists = await taskGroupSubmissionService.findById(id);
    if (!taskGroupSubmissionExists) {
      req.flash("error", "Group task submission not found");
      return res.redirect("back");
    }

    await taskGroupSubmissionService.update(id, { status });
    req.flash("success", "Group task submission was updated successfully!");
  } catch {
    req.flash("error", "Something went wrong!");
  }
  return res.redirect("back");
};

// [DELETE] /admin/taskGroupSubmissions/delete/:id
const del = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("taskGroupSubmissionDelete")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/taskGroupSubmissions`);
    }

    const id: string = req.params.id;

    const taskGroupSubmissionExists = await taskGroupSubmissionService.findById(id);
    if (!taskGroupSubmissionExists) {
      req.flash("error", "Group task submission not found");
      return res.redirect("back");
    }

    await taskGroupSubmissionService.del(id);
    req.flash("success", "Group task submission was deleted successfully!");
  } catch {
    req.flash("error", "Something went wrong!");
  }
  return res.redirect("back");
};

const taskGroupSubmissionController = {
  get,
  getById,
  watchMaterials,
  create,
  createPost,
  update,
  actions,
  updatePatch,
  updateStatus,
  del
};
export default taskGroupSubmissionController;