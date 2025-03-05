"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERoomChatRole = exports.ERoomChatStatus = exports.ERoomChatType = void 0;
var ERoomChatType;
(function (ERoomChatType) {
    ERoomChatType["friend"] = "friend";
    ERoomChatType["group"] = "group";
})(ERoomChatType || (exports.ERoomChatType = ERoomChatType = {}));
;
var ERoomChatStatus;
(function (ERoomChatStatus) {
    ERoomChatStatus["active"] = "active";
    ERoomChatStatus["inactive"] = "inactive";
})(ERoomChatStatus || (exports.ERoomChatStatus = ERoomChatStatus = {}));
;
var ERoomChatRole;
(function (ERoomChatRole) {
    ERoomChatRole["superAdmin"] = "superAdmin";
    ERoomChatRole["admin"] = "admin";
    ERoomChatRole["user"] = "user";
})(ERoomChatRole || (exports.ERoomChatRole = ERoomChatRole = {}));
;
