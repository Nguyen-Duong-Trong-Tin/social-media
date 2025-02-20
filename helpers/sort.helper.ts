import { Request } from "express";
import { SortOrder } from "mongoose";

const sortHelper = (req: Request) => {
  const sort: { [key: string]: SortOrder } = {};
  if (req.query.sort) {
    const token = (req.query.sort as string).split('-');
    const sortKey = token[0];
    const sortValue = token[1];

    sort[sortKey] = sortValue as SortOrder;
  }

  sort["createdAt"] = "desc";

  return sort;
}

export default sortHelper;