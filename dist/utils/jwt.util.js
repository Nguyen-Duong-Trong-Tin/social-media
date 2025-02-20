"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const accountGenerate = (accountId, roleId, expiresIn) => {
    return jwt.sign({ accountId, roleId }, process.env.TOKEN_SECRET, { expiresIn });
};
const accountVerify = (token) => {
    const verify = {
        success: false,
        account: { accountId: "", roleId: "" }
    };
    jwt.verify(token, process.env.TOKEN_SECRET, (err, account) => {
        if (err) {
            return;
        }
        verify.success = true;
        verify.account = account;
    });
    return verify;
};
const jwtUtil = {
    accountGenerate,
    accountVerify
};
exports.default = jwtUtil;
