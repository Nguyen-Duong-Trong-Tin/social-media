import { Request } from "express";

const paginationHelper = (req: Request) => {
  const pagination: {
    page: number;
    limit: number;
    skip: number;
  } = {
    page: 1,
    limit: 10,
    skip: 0
  };

  if (req.query.page && req.query.limit) {
    const page: number = parseInt(req.query.page as string); 
    pagination.limit = parseInt(req.query.limit as string);

    pagination.page = page;
    pagination.skip = (page - 1) * pagination.limit;
  }

  return pagination;
}

export default paginationHelper;