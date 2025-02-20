import { Request } from "express";

const getUrlHelper = (req: Request) => {
  return {
    base: `${req.protocol}://${req.get("host")}${req.originalUrl.split('?')[0]}`,
    query: req.query
  };
}

export default getUrlHelper;