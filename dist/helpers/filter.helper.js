"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const filterHelper = (req) => {
    const filter = {};
    const paramFilter = req.query.filter;
    if (paramFilter) {
        const token = paramFilter.split('-');
        filter[token[0]] = token[1];
    }
    return filter;
};
exports.default = filterHelper;
