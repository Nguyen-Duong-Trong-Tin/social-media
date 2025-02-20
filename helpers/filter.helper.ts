import { Request } from "express";

const filterHelper = (req: Request): { [key: string]: any } => {
  const filter: { [key: string]: any } = {};
  const paramFilter = req.query.filter as string;

  if (paramFilter) {
    const token = paramFilter.split('-');
    filter[token[0]] = token[1];
  }

  return filter;
}

export default filterHelper;