import { NextFunction, Response } from "express";

import { ETaskGroupStatus } from "../../enums/taskGroup.enum";

// [POST] /admin/taskGroups/create
const createPost = (req: any, res: Response, next: NextFunction): void => {
  try {
    const title = req.body.title;
    const description = req.body.description;
    const images = req.files["images"];
    const videos = req.files["videos"];
    const status = req.body.status;
    const userId = req.body.userId;
    const groupId = req.body.groupId;

    if (!title || !description || !status || !userId || !groupId) {
      req.flash("error", "Thông tin không đầy đủ!");
      return res.redirect("back");
    }

    if (
      typeof title !== "string" ||
      typeof description !== "string" ||
      typeof status !== "string" ||
      typeof userId !== "string" ||
      typeof groupId !== "string"
    ) {
      req.flash("error", "Kiểu dữ liệu không chính xác!");
      return res.redirect("back");
    }

    if (images && images.length > 6) {
      req.flash("error", "Chỉ chọn tối đa 6 ảnh!");
      return res.redirect("back");
    }

    if (videos && videos.length > 6) {
      req.flash("error", "Chỉ chọn tối đa 6 đoạn phim!");
      return res.redirect("back");
    }

    if (!Object.values(ETaskGroupStatus).includes(status as ETaskGroupStatus)) {
      req.flash("error", "Trạng thái không chính xác!");
      return res.redirect("back");
    }

    return next();
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
};

// [PATCH] /admin/taskGroups/update/:id
const updatePatch = (req: any, res: Response, next: NextFunction): void => {
  try {
    const title = req.body.title;
    const description = req.body.description;
    const images = req.files["images"];
    const videos = req.files["videos"];
    const status = req.body.status;
    const userId = req.body.userId;
    const groupId = req.body.groupId;

    if (!title || !description || !status || !userId || !groupId) {
      req.flash("error", "Thông tin không đầy đủ!");
      return res.redirect("back");
    }

    if (
      typeof title !== "string" ||
      typeof description !== "string" ||
      typeof status !== "string" ||
      typeof userId !== "string" ||
      typeof groupId !== "string"
    ) {
      req.flash("error", "Kiểu dữ liệu không chính xác!");
      return res.redirect("back");
    }

    if (images && images.length > 6) {
      req.flash("error", "Chỉ chọn tối đa 6 ảnh!");
      return res.redirect("back");
    }

    if (videos && videos.length > 6) {
      req.flash("error", "Chỉ chọn tối đa 6 đoạn phim!");
      return res.redirect("back");
    }

    if (!Object.values(ETaskGroupStatus).includes(status as ETaskGroupStatus)) {
      req.flash("error", "Trạng thái không chính xác!");
      return res.redirect("back");
    }

    return next();
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
};

// [PATCH] /admin/taskGroups/actions
const actions = (req: any, res: Response, next: NextFunction): void => {
  try {
    const action = req.body.action;
    const ids = req.body.ids;

    if (!action || !ids) {
      req.flash("error", "Thiếu thông tin cần thiết!");
      return res.redirect("back");
    }

    if (typeof action !== "string" || typeof ids !== "string") {
      req.flash("error", "Kiểu dữ liệu không chính xác!");
      return res.redirect("back");
    }

    return next();
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
};

// [PATCH] /admin/taskGroups/updateStatus/:status/:id
const updateStatus = (req: any, res: Response, next: NextFunction): void => {
  try {
    const status: string = req.params.status;

    if (!Object.values(ETaskGroupStatus).includes(status as ETaskGroupStatus)) {
      req.flash("error", "Trạng thái không chính xác!");
      return res.redirect("back");
    }

    return next();
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
};

const taskGroupValidate = {
  createPost,
  updatePatch,
  actions,
  updateStatus,
};
export default taskGroupValidate;
