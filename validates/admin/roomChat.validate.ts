import { NextFunction, Response } from "express";

import { ERoomChatRole, ERoomChatStatus } from "../../enums/roomChat.enum";

// [POST] /admin/roomChats/create
const createPost = (req: any, res: Response, next: NextFunction): void => {
  try {
    const title = req.body.title;
    const avatar = req.file;
    const status = req.body.status;
    const userId = req.body.userId;

    if (
      !title ||
      !avatar ||
      !status ||
      !userId
    ) {
      req.flash("error", "Thông tin không đầy đủ!");
      return res.redirect("back");
    }

    if (
      typeof title !== "string" ||
      typeof status !== "string" ||
      typeof userId !== "string"
    ) {
      req.flash("error", "Kiểu dữ liệu không chính xác!");
      return res.redirect("back");
    }

    if (!Object.values(ERoomChatStatus).includes(status as ERoomChatStatus)) {
      req.flash("error", "Trạng thái không chính xác!");
      return res.redirect("back");
    }

    return next();
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [PATCH] /admin/roomChats/update/:id
const updatePatch = (req: any, res: Response, next: NextFunction): void => {
  try {
    const title = req.body.title;
    const status = req.body.status;

    if (
      !title ||
      !status
    ) {
      req.flash("error", "Có lỗi xảy ra!");
      return res.redirect("back");
    }

    if (
      typeof title !== "string" ||
      typeof status !== "string"
    ) {
      req.flash("error", "Kiểu dữ liệu không chính xác!");
      return res.redirect("back");
    }

    return next();
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [PATCH] /admin/roomChats/changeUserRole/:role/:userId/:id
const changeUserRole = (req: any, res: Response, next: NextFunction): void => {
  try {
    const role: string = req.params.role;

    if (!Object.values(ERoomChatRole).includes(role as ERoomChatRole)) {
      req.flash("error", "Vai trò người dùng không chính xác!");
      return res.redirect("back");
    }

    return next();
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [PATCH] /admin/roomChats/actions
const actions = (req: any, res: Response, next: NextFunction): void => {
  try {
    const action = req.body.action;
    const ids = req.body.ids;

    if (
      !action ||
      !ids
    ) {
      req.flash("error", "Thiếu thông tin cần thiết!");
      return res.redirect("back");
    }

    if (
      typeof action !== "string" ||
      typeof ids !== "string"
    ) {
      req.flash("error", "Kiểu dữ liệu không chính xác!");
      return res.redirect("back");
    }

    return next();
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

// [PATCH] /admin/roomChats/updateStatus/:status/:id
const updateStatus = (req: any, res: Response, next: NextFunction): void => {
  try {
    const status: string = req.params.status;

    if (!Object.values(ERoomChatStatus).includes(status as ERoomChatStatus)) {
      req.flash("error", "Trạng thái không chính xác!");
      return res.redirect("back");
    }

    return next();
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

const roomChatValidate = {
  createPost,
  updatePatch,
  changeUserRole,
  actions,
  updateStatus
};
export default roomChatValidate;