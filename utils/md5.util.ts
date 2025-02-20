const md5 = require("md5");

const encode = (string: string) => {
  return md5(string);
}
 
const md5Util = {
  encode
};
export default md5Util;