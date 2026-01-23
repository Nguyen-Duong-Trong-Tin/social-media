import { Response } from "express";

// [GET] /admin/dashboard
const get = (req: any, res: Response): void => {
  try {
    return res.render("admin/pages/dashboard", { pageTitle: "Dashboard" });
  } catch {
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
}

const dashboardController = {
  get
};
export default dashboardController;