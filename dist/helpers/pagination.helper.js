"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const paginationHelper = (req) => {
    const pagination = {
        limit: 10,
        skip: 0
    };
    if (req.query.page && req.query.limit) {
        const page = parseInt(req.query.page);
        pagination.limit = parseInt(req.query.limit);
        pagination.skip = (page - 1) * pagination.limit;
    }
    return pagination;
};
exports.default = paginationHelper;
