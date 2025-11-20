"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EGroupRole = exports.EGroupStatus = void 0;
var EGroupStatus;
(function (EGroupStatus) {
    EGroupStatus["active"] = "active";
    EGroupStatus["inactive"] = "inactive";
})(EGroupStatus || (exports.EGroupStatus = EGroupStatus = {}));
var EGroupRole;
(function (EGroupRole) {
    EGroupRole["superAdmin"] = "superAdmin";
    EGroupRole["admin"] = "admin";
    EGroupRole["user"] = "user";
    EGroupRole["teacher"] = "teacher";
})(EGroupRole || (exports.EGroupRole = EGroupRole = {}));
