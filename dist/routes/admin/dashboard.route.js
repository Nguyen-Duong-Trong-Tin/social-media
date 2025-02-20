"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const dashboard_controller_1 = __importDefault(require("../../controllers/admin/dashboard.controller"));
router.get("/", dashboard_controller_1.default.get);
exports.default = router;
