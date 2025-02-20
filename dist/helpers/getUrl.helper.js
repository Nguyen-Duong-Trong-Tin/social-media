"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getUrlHelper = (req) => {
    return {
        base: `${req.protocol}://${req.get("host")}${req.originalUrl.split('?')[0]}`,
        query: req.query
    };
};
exports.default = getUrlHelper;
