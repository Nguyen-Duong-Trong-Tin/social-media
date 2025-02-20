import { Response } from "express";

// [GET] /admin/dashboard
const get = (req: any, res: Response): void => {
  try {
    return res.render("admin/pages/dashboard", { pageTitle: "Tổng Quan" });
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
}

const dashboardController = {
  get
};
export default dashboardController;