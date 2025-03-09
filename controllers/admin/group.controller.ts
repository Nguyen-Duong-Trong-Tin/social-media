import { Response } from "express";

import configs from "../../configs/index.config";

import { EGroupRole, EGroupStatus } from "../../enums/group.enum";

import getUrlHelper from "../../helpers/getUrl.helper";

import groupService from "../../services/admin/group.service";
import userService from "../../services/admin/user.service";
import groupTopicService from "../../services/admin/groupTopic.service";

import slugUtil from "../../utils/slug.util";
import shortUniqueKeyUtil from "../../utils/shortUniqueKey.util";

// [GET] /admin/groups?page=:page&limit=:limit&keyword=:keyword&sort=:sort&filter=:filter
const get = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("groupView")) {
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
        { value: "title-asc", title: "Tiêu đề cộng đồng tăng dần" },
        { value: "title-desc", title: "Tiêu đề cộng đồng giảm dần" }
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

    const [maxPage, groups] = await Promise.all([
      groupService.calculateMaxPage(limit),
      groupService.find(req)
    ]);
    const groupTopics = await Promise.all(groups.map(group => groupTopicService.findById(group.groupTopicId)));

    return res.render("admin/pages/groups", {
      pageTitle: "Danh Sách Cộng Đồng",
      url: getUrlHelper(req),
      groups,
      groupTopics,
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

// [GET] /admin/groups/detail/:id
const getById = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("groupView")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/dashboard`);
    }

    const id: string = req.params.id;

    const groupExists = await groupService.findById(id);
    if (!groupExists) {
      req.flash("error", "Cộng đồng không tồn tại!");
      return res.redirect("back");
    }

    const [
      groupTopics,
      users,
      userRequests
    ] = await Promise.all([
      groupTopicService.findAll(),

      Promise.all(groupExists.users.map(user => userService.findById(user.userId as string).then(data => ({
        user: data,
        role: user.role
      })))),

      Promise.all(groupExists.userRequests.map(userRequest => userService.findById(userRequest)))
    ]);

    return res.render("admin/pages/groups/detail", {
      pageTitle: "Chi Tiết Cộng Đồng",
      group: groupExists,
      groupTopics,
      users,
      userRequests
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [GET] /admin/groups/create
const create = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("groupCreate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/groups`);
    }

    const [
      users,
      groupTopics
    ] = await Promise.all([
      userService.findAll(),
      groupTopicService.findAll()
    ]);

    return res.render("admin/pages/groups/create", {
      pageTitle: "Tạo Mới Cộng Đồng",
      users,
      groupTopics
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [POST] /admin/groups/create
const createPost = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("groupCreate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/groups`);
    }

    const title: string = req.body.title;
    const slug: string = slugUtil.convert(title) + '-' + shortUniqueKeyUtil.generate();
    const description: string = req.body.description;
    const avatar: string = req.files["avatar"][0].path;
    const coverPhoto: string = req.files["coverPhoto"][0].path;
    const status: EGroupStatus = req.body.status;
    const userId: string = req.body.userId;
    const groupTopicId: string = req.body.groupTopicId;

    const [
      groupSlugExists,
      userExists,
      groupTopicExists
    ] = await Promise.all([
      groupService.findBySlug(slug),
      userService.findById(userId),
      groupTopicService.findById(groupTopicId)
    ]);
    if (groupSlugExists) {
      req.flash("error", "Có lỗi xảy ra!");
      return res.redirect("back");
    }
    if (!userExists) {
      req.flash("error", "Người dùng không tồn tại!");
      return res.redirect("back");
    }
    if (!groupTopicExists) {
      req.flash("error", "Chủ đề cộng đồng không tồn tại!");
      return res.redirect("back");
    }

    const users: {
      userId: string;
      role: EGroupRole
    }[] = [{ userId, role: EGroupRole.superAdmin }];

    await groupService.create({
      title,
      slug,
      description,
      avatar,
      coverPhoto,
      status,
      users,
      userRequests: [],
      groupTopicId,
      deleted: false
    });
    req.flash("success", "Cộng đồng được tạo thành công!");
    return res.redirect(`/${configs.admin}/groups`);
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [GET] /admin/groups/update/:id
const update = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("groupUpdate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/groups`);
    }

    const id: string = req.params.id;

    const groupExists = await groupService.findById(id);
    if (!groupExists) {
      req.flash("error", "Cộng đồng không tồn tại!");
      return res.redirect("back");
    }

    const [
      groupTopics,
      users,
      userRequests
    ] = await Promise.all([
      groupTopicService.findAll(),

      Promise.all(groupExists.users.map(user => userService.findById(user.userId as string).then(data => ({
        user: data,
        role: user.role
      })))),

      Promise.all(groupExists.userRequests.map(userRequest => userService.findById(userRequest)))
    ]);

    return res.render("admin/pages/groups/update", {
      pageTitle: "Cập Nhật Cộng Đồng",
      group: groupExists,
      groupTopics,
      users,
      userRequests
    });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [PATCH] /admin/groups/update/:id
const updatePatch = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("groupUpdate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/groups`);
    }

    const id: string = req.params.id;

    const title: string = req.body.title;
    const slug: string = slugUtil.convert(title) + '-' + shortUniqueKeyUtil.generate();
    const description: string = req.body.description;
    const status: EGroupStatus = req.body.status;
    const groupTopicId: string = req.body.groupTopicId;

    let avatar: string | undefined = undefined;
    if (req.files["avatar"]) {
      avatar = req.files["avatar"][0].path;
    }
    let coverPhoto: string | undefined = undefined;
    if (req.files["coverPhoto"]) {
      coverPhoto = req.files["coverPhoto"][0].path;
    }

    const [
      groupExists,
      groupSlugExists,
      groupTopicExists
    ] = await Promise.all([
      groupService.findById(id),
      groupService.findBySlug(slug),
      groupTopicService.findById(groupTopicId)
    ]);
    if (!groupExists) {
      req.flash("error", "Cộng đồng không tồn tại!");
      return res.redirect("back");
    }
    if (groupSlugExists) {
      req.flash("error", "Có lỗi xảy ra!");
      return res.redirect("back");
    }
    if (!groupTopicExists) {
      req.flash("error", "Chủ đề cộng đồng không tồn tại!");
      return res.redirect("back");
    }

    await groupService.update(id, {
      title,
      slug,
      description,
      avatar,
      coverPhoto,
      status,
      groupTopicId
    })
    req.flash("success", "Cộng đồng được cập nhật thành công!");
  } catch(e) {
    console.log(e);

    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

// [PATCH] /admin/groups/changeUserRole/:role/:userId/:id
const changeUserRole = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("groupUpdate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/dashboard`);
    }

    const id: string = req.params.id;
    const userId: string = req.params.userId;
    const role: string = req.params.role;

    const [
      groupExists,
      userExists
    ] = await Promise.all([
      groupService.findById(id),
      userService.findById(userId)
    ]);
    if (!groupExists) {
      req.flash("error", "Cộng đồng không tồn tại!");
      return res.redirect("back");
    }
    if (!userExists) {
      req.flash("error", "Người dùng không tồn tại!");
      return res.redirect("back");
    }

    await groupService.changeUserRole(
      id,
      userId,
      role
    );
    req.flash("success", "Vai trò người dùng được cập nhật thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

// [PATCH] /admin/groups/acceptUser/:userId/:id
const acceptUser = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("groupUpdate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/dashboard`);
    }

    const id: string = req.params.id;
    const userId: string = req.params.userId;

    const [
      groupExists,
      userExists,
      groupUserExists
    ] = await Promise.all([
      groupService.findById(id),
      userService.findById(userId),
      groupService.findUserInGroup(id, userId)
    ]);
    if (!groupExists) {
      req.flash("error", "Cộng đồng không tồn tại!");
      return res.redirect("back");
    }
    if (!userExists) {
      req.flash("error", "Người dùng không tồn tại!");
      return res.redirect("back");
    }
    if (groupUserExists) {
      req.flash("error", "Người dùng đã tồn tại trong cộng đồng!");
      return res.redirect("back");
    }

    await groupService.acceptUser(id, userId);
    await groupService.delUserRequest(id, userId);
    req.flash("success", "Người dùng được thêm vào cộng đồng thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

// [PATCH] /admin/groups/actions
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
        if (!myAccount.permissions.includes("groupDelete")) {
          req.flash("error", "Bạn không có quyền!");
          return res.redirect(`/${configs.admin}/groups`);
        }

        await Promise.all(ids.map(id => groupService.del(id)));

        break;
      }

      case "active": {
        if (!myAccount.permissions.includes("groupUpdate")) {
          req.flash("error", "Bạn không có quyền!");
          return res.redirect(`/${configs.admin}/groups`);
        }

        await Promise.all(ids.map(id => groupService.update(id, { status: EGroupStatus.active })));

        break;
      }

      case "inactive": {
        if (!myAccount.permissions.includes("groupUpdate")) {
          req.flash("error", "Bạn không có quyền!");
          return res.redirect(`/${configs.admin}/groups`);
        }

        await Promise.all(ids.map(id => groupService.update(id, { status: EGroupStatus.inactive })));

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

// [PATCH] /admin/groups/updateStatus/:status/:id
const updateStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("groupUpdate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/groups`);
    }

    const id: string = req.params.id;
    const status: EGroupStatus = req.params.status;

    const groupExists = await groupService.findById(id);
    if (!groupExists) {
      req.flash("error", "Cộng đồng không tồn tại!");
      return res.redirect("back");
    }

    await groupService.update(id, { status });
    req.flash("success", "Cộng đồng được cập nhật thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

// [DELETE] /admin/groups/changeUserRole/:userId/:id
const delUser = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("groupUpdate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/dashboard`);
    }

    const id: string = req.params.id;
    const userId: string = req.params.userId;

    const [
      groupExists,
      userExists
    ] = await Promise.all([
      groupService.findById(id),
      userService.findById(userId)
    ]);
    if (!groupExists) {
      req.flash("error", "Cộng đồng không tồn tại!");
      return res.redirect("back");
    }
    if (!userExists) {
      req.flash("error", "Người dùng không tồn tại!");
      return res.redirect("back");
    }

    await groupService.delUser(id, userId);
    req.flash("success", "Người dùng được xóa thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

// [DELETE] /admin/groups/deleteUserRequest/:userId/:id
const delUserRequest = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("groupUpdate")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/dashboard`);
    }

    const id: string = req.params.id;
    const userId: string = req.params.userId;

    const [
      groupExists,
      userExists
    ] = await Promise.all([
      groupService.findById(id),
      userService.findById(userId)
    ]);
    if (!groupExists) {
      req.flash("error", "Cộng đồng không tồn tại!");
      return res.redirect("back");
    }
    if (!userExists) {
      req.flash("error", "Người dùng không tồn tại!");
      return res.redirect("back");
    }

    await groupService.delUserRequest(id, userId);
    req.flash("success", "Yêu cầu người dùng được xóa thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

// [DELETE] /admin/groups/delete/:id
const del = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("groupDelete")) {
      req.flash("error", "Bạn không có quyền!");
      return res.redirect(`/${configs.admin}/groups`);
    }

    const id: string = req.params.id;

    const groupExists = await groupService.findById(id);
    if (!groupExists) {
      req.flash("error", "Cộng đồng không tồn tại!");
      return res.redirect("back");
    }

    await groupService.del(id);
    req.flash("success", "Cộng đồng được xóa thành công!");
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
  }
  return res.redirect("back");
}

const groupController = {
  get,
  getById,
  create,
  createPost,
  update,
  updatePatch,
  changeUserRole,
  acceptUser,
  actions,
  updateStatus,
  delUser,
  delUserRequest,
  del
};
export default groupController;