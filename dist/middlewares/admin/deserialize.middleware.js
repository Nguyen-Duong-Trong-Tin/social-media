"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_config_1 = __importDefault(require("../../configs/index.config"));
const jwt_util_1 = __importDefault(require("../../utils/jwt.util"));
const account_service_1 = __importDefault(require("../../services/admin/account.service"));
const deserialize = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token;
        if (!token) {
            req.flash("error", "Login to continue!");
            return res.redirect(`/${index_config_1.default.admin}/auth/login`);
        }
        const verify = jwt_util_1.default.accountVerify(token);
        if (!verify.success) {
            req.flash("error", "Login to continue!");
            return res.redirect(`/${index_config_1.default.admin}/auth/login`);
        }
        const accountExists = yield account_service_1.default.findById(verify.account.accountId);
        if (!accountExists) {
            req.flash("error", "Login to continue!");
            return res.redirect(`/${index_config_1.default.admin}/auth/login`);
        }
        res.locals.myAccount = Object.assign(Object.assign({}, verify.account), { fullName: accountExists.fullName });
        return next();
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
        return res.redirect("back");
    }
});
exports.default = deserialize;
