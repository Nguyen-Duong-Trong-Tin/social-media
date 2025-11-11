"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const accountGenerate = (accountId, permissions, expiresIn) => {
    return jwt.sign({ accountId, permissions }, process.env.TOKEN_SECRET, { expiresIn });
};
const generateRefreshToken = (accountId, permissions, expiresIn) => {
    return jwt.sign({ accountId, permissions }, process.env.REFRESH_TOKEN_SECRET, { expiresIn });
};
const accountVerify = (token) => {
    const verify = {
        success: false,
        account: { accountId: "", permissions: [] },
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
const verfifyRefreshToken = (token) => {
    const verify = {
        success: false,
        account: { accountId: "", permissions: [] },
    };
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, account) => {
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
    generateRefreshToken,
    accountVerify,
    verfifyRefreshToken
};
exports.default = jwtUtil;
