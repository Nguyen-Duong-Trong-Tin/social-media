import { Request } from "express";

const paginationHelper = (req: Request) => {
  const pagination: {
    limit: number;
    skip: number;
  } = {
    limit: 10,
    skip: 0
  };

  if (req.query.page && req.query.limit) {
    const page: number = parseInt(req.query.page as string); 
    pagination.limit = parseInt(req.query.limit as string);

    pagination.skip = (page - 1) * pagination.limit;
  }

  return pagination;
}

export default paginationHelper;