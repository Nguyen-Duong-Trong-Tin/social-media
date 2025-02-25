const slug = require("slug");

const convert = (string: string) => {
  return slug(string);
}

const slugUtil = {
  convert
};
export default slugUtil;