import { Response } from "express";

import configs from "../../configs/index.config";

import { ERoomChatRole, ERoomChatStatus, ERoomChatType } from "../../enums/roomChat.enum";

import getUrlHelper from "../../helpers/getUrl.helper";

import roomChatService from "../../services/admin/roomChat.service";
import userService from "../../services/admin/user.service";

import slugUtil from "../../utils/slug.util";
import shortUniqueKeyUtil from "../../utils/shortUniqueKey.util";

// [GET] /admin/roomChats?page=:page&limit=:limit&keyword=:keyword&sort=:sort&filter=:filter
const get = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("roomChatView")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/dashboard`);
    }

    const filter: string = req.query.filter;
    const filterOptions: {
      value: string,
      title: string
    }[] = [
        { value: "", title: "---" },
        { value: "type-group", title: "Group type" },
        { value: "type-friend", title: "Friend type" },
        { value: "status-active", title: "Active status" },
        { value: "status-inactive", title: "Inative status" },
      ];

    const sort: string = req.query.sort;
    const sortOptions: {
      value: string,
      title: string
    }[] = [
        { value: "", title: "---" },
        { value: "title-asc", title: "Title (A - Z)" },
        { value: "title-desc", title: "Title (Z - A)" }
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

    const [maxPage, roomChats] = await Promise.all([
      roomChatService.calculateMaxPage(limit),
      roomChatService.find(req)
    ]);

    return res.render("admin/pages/roomChats", {
      pageTitle: "List of room chats",
      url: getUrlHelper(req),
      roomChats,
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

// [GET] /admin/roomChats/detail/:id
const getById = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("roomChatView")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/dashboard`);
    }

    const id: string = req.params.id;

    const roomChatExists = await roomChatService.findById(id);
    if (!roomChatExists) {
      req.flash("error", "Room chat not found!");
      return res.redirect("back");
    }

    const [
      users,
      userRequests
    ] = await Promise.all([
      Promise.all(roomChatExists.users.map(user => userService.findById(user.userId as string).then(data => ({
        user: data,
        role: user.role
      })))),

      Promise.all(roomChatExists.userRequests.map(userRequest => userService.findById(userRequest)))
    ]);

    return res.render("admin/pages/roomChats/detail", {
      pageTitle: "Room chat details",
      roomChat: roomChatExists,
      users,
      userRequests
    });
  } catch {
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
}

// [GET] /admin/roomChats/create
const create = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("roomChatCreate")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/roomChats`);
    }

    const users = await userService.findAll();
    return res.render("admin/pages/roomChats/create", {
      pageTitle: "Create new room chat",
      users
    });
  } catch {
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
}

// [POST] /admin/roomChats/create
const createPost = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("roomChatCreate")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/roomChats`);
    }

    const title: string = req.body.title;
    const slug: string = slugUtil.convert(title) + '-' + shortUniqueKeyUtil.generate();
    const type: ERoomChatType = ERoomChatType.group;
    const avatar: string = req.file.path;
    const status: ERoomChatStatus = req.body.status;
    const userId: string = req.body.userId;

    const [
      roomChatSlugExists,
      userExists
    ] = await Promise.all([
      roomChatService.findBySlug(slug),
      userService.findById(userId)
    ]);
    if (roomChatSlugExists) {
      req.flash("error", "Something went wrong!");
      return res.redirect("back");
    }
    if (!userExists) {
      req.flash("error", "User not found!");
      return res.redirect("back");
    }

    const users: {
      userId: string;
      role: ERoomChatRole
    }[] = [{ userId, role: ERoomChatRole.superAdmin }];

    await roomChatService.create({
      title,
      slug,
      type,
      avatar,
      status,
      users,
      userRequests: [],
      deleted: false
    });
    req.flash("success", "Room chat was created successfully!");
    return res.redirect(`/${configs.admin}/roomChats`);
  } catch {
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
}

// [GET] /admin/roomChats/update/:id
const update = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("roomChatUpdate")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/roomChats`);
    }

    const id: string = req.params.id;

    const roomChatExists = await roomChatService.findById(id);
    if (!roomChatExists) {
      req.flash("error", "Room chat not found!");
      return res.redirect("back");
    }
    if (roomChatExists.type === "friend") {
      req.flash("error", "Room chat of friend type cannot modified!");
      return res.redirect("back");
    }

    const [
      users,
      userRequests
    ] = await Promise.all([
      Promise.all(roomChatExists.users.map(user => userService.findById(user.userId as string).then(data => ({
        user: data,
        role: user.role
      })))),

      Promise.all(roomChatExists.userRequests.map(userRequest => userService.findById(userRequest)))
    ]);

    return res.render("admin/pages/roomChats/update", {
      pageTitle: "Update new room chat",
      roomChat: roomChatExists,
      users,
      userRequests
    });
  } catch {
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
}

// [PATCH] /admin/roomChats/update/:id
const updatePatch = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("roomChatUpdate")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/roomChats`);
    }

    const id: string = req.params.id;

    const title: string = req.body.title;
    const slug: string = slugUtil.convert(title) + '-' + shortUniqueKeyUtil.generate();
    const status: ERoomChatStatus = req.body.status;

    let avatar: string | undefined = undefined;
    if (req.file) {
      avatar = req.file.path;
    }

    const [
      roomChatExists,
      roomChatSlugExists
    ] = await Promise.all([
      roomChatService.findById(id),
      roomChatService.findBySlug(slug)
    ]);
    if (!roomChatExists) {
      req.flash("error", "Room chat not found");
      return res.redirect("back");
    }
    if (roomChatExists.type === "friend") {
      req.flash("error", "Room chat of friend type cannot modified!");
      return res.redirect("back");
    }
    if (roomChatSlugExists) {
      req.flash("error", "Something went wrong!");
      return req.redirect("back");
    }

    await roomChatService.update(id, {
      title,
      slug,
      avatar,
      status
    });
    req.flash("success", "Room chat was updated successfully!");
  } catch {
    req.flash("error", "Something went wrong!");
  }
  return res.redirect("back");
}

// [PATCH] /admin/roomChats/changeUserRole/:role/:userId/:id
const changeUserRole = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("roomChatUpdate")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/dashboard`);
    }

    const id: string = req.params.id;
    const userId: string = req.params.userId;
    const role: string = req.params.role;

    const [
      roomChatExists,
      userExists
    ] = await Promise.all([
      roomChatService.findById(id),
      userService.findById(userId)
    ]);
    if (!roomChatExists) {
      req.flash("error", "Room chat not found");
      return res.redirect("back");
    }
    if (!userExists) {
      req.flash("error", "User not found!");
      return res.redirect("back");
    }

    await roomChatService.changeUserRole(
      id,
      userId,
      role
    );
    req.flash("success", "User role was updated successfully!");
  } catch {
    req.flash("error", "Something went wrong!");
  }
  return res.redirect("back");
}

// [PATCH] /admin/roomChats/acceptUser/:userId/:id
const acceptUser = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("roomChatUpdate")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/dashboard`);
    }

    const id: string = req.params.id;
    const userId: string = req.params.userId;

    const [
      roomChatExists,
      userExists,
      roomChatUserExists
    ] = await Promise.all([
      roomChatService.findById(id),
      userService.findById(userId),
      roomChatService.findUserInRoomChat(id, userId)
    ]);
    if (!roomChatExists) {
      req.flash("error", "Room chat not found");
      return res.redirect("back");
    }
    if (!userExists) {
      req.flash("error", "User not found!");
      return res.redirect("back");
    }
    if (roomChatUserExists) {
      req.flash("error", "User is already in the room chat!");
      return res.redirect("back");
    }

    await roomChatService.acceptUser(id, userId);
    await roomChatService.delUserRequest(id, userId);
    req.flash("success", "User was added to the room chat successfully!");
  } catch {
    req.flash("error", "Something went wrong!");
  }
  return res.redirect("back");
}

// [PATCH] /admin/roomChats/actions
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
        if (!myAccount.permissions.includes("roomChatDelete")) {
          req.flash("error", "Access denied!");
          return res.redirect(`/${configs.admin}/roomChats`);
        }

        await Promise.all(ids.map(id => roomChatService.del(id)));

        break;
      }

      case "active": {
        if (!myAccount.permissions.includes("roomChatUpdate")) {
          req.flash("error", "Access denied!");
          return res.redirect(`/${configs.admin}/roomChats`);
        }

        await Promise.all(ids.map(id => roomChatService.update(id, { status: ERoomChatStatus.active })));

        break;
      }

      case "inactive": {
        if (!myAccount.permissions.includes("roomChatUpdate")) {
          req.flash("error", "Access denied!");
          return res.redirect(`/${configs.admin}/roomChats`);
        }

        await Promise.all(ids.map(id => roomChatService.update(id, { status: ERoomChatStatus.inactive })));

        break;
      }

      default: {
        req.flash("error", "Action wrong!");
        return res.redirect("back");
      }
    }

    req.flash("success", "Room chats were updated successfully!");
  } catch {
    req.flash("error", "Something went wrong!");
  }
  return res.redirect("back");
}

// [PATCH] /admin/roomChats/updateStatus/:status/:id
const updateStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("roomChatUpdate")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/roomChats`);
    }

    const id: string = req.params.id;
    const status: ERoomChatStatus = req.params.status;

    const roomChatExists = await roomChatService.findById(id);
    if (!roomChatExists) {
      req.flash("error", "Room chat not found");
      return res.redirect("back");
    }

    await roomChatService.update(id, { status });
    req.flash("success", "Room chat was updated successfully!");
  } catch {
    req.flash("error", "Something went wrong!");
  }
  return res.redirect("back");
}

// [DELETE] /admin/roomChats/changeUserRole/:userId/:id
const delUser = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("roomChatUpdate")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/dashboard`);
    }

    const id: string = req.params.id;
    const userId: string = req.params.userId;

    const [
      roomChatExists,
      userExists
    ] = await Promise.all([
      roomChatService.findById(id),
      userService.findById(userId)
    ]);
    if (!roomChatExists) {
      req.flash("error", "Room chat not found");
      return res.redirect("back");
    }
    if (!userExists) {
      req.flash("error", "User not found!");
      return res.redirect("back");
    }

    await roomChatService.delUser(id, userId);
    req.flash("success", "User was deleted successfully!");
  } catch {
    req.flash("error", "Something went wrong!");
  }
  return res.redirect("back");
}

// [DELETE] /admin/roomChats/deleteUserRequest/:userId/:id
const delUserRequest = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string;
      permissions: string[];
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("roomChatUpdate")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/dashboard`);
    }

    const id: string = req.params.id;
    const userId: string = req.params.userId;

    const [
      roomChatExists,
      userExists
    ] = await Promise.all([
      roomChatService.findById(id),
      userService.findById(userId)
    ]);
    if (!roomChatExists) {
      req.flash("error", "Room chat not found");
      return res.redirect("back");
    }
    if (!userExists) {
      req.flash("error", "User not found!");
      return res.redirect("back");
    }

    await roomChatService.delUserRequest(id, userId);
    req.flash("success", "User request was deleted successfully!");
  } catch {
    req.flash("error", "Something went wrong!");
  }
  return res.redirect("back");
}

// [DELETE] /admin/roomChats/delete/:id
const del = async (req: any, res: Response): Promise<void> => {
  try {
    const myAccount: {
      accountId: string,
      permissions: string[]
    } = res.locals.myAccount;

    if (!myAccount.permissions.includes("roomChatDelete")) {
      req.flash("error", "Access denied!");
      return res.redirect(`/${configs.admin}/roomChats`);
    }

    const id: string = req.params.id;

    const roomChatExists = await roomChatService.findById(id);
    if (!roomChatExists) {
      req.flash("error", "Room chat not found");
      return res.redirect("back");
    }

    await roomChatService.del(id);
    req.flash("success", "Room chat was deleted successfully!");
  } catch {
    req.flash("error", "Something went wrong!");
  }
  return res.redirect("back");
}

const roomChatController = {
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
export default roomChatController;