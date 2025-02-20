import express, { Router } from "express";
const router: Router = express.Router();

import controller from "../../controllers/admin/dashboard.controller";

router.get("/", controller.get);

export default router;