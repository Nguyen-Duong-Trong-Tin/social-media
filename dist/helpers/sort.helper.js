"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sortHelper = (req) => {
    const sort = {};
    if (req.query.sort) {
        const token = req.query.sort.split('-');
        const sortKey = token[0];
        const sortValue = token[1];
        sort[sortKey] = sortValue;
    }
    sort["createdAt"] = "desc";
    return sort;
};
exports.default = sortHelper;
