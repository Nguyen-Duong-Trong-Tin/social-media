import ShortUniqueId from "short-unique-id";

const generate = () => {
  const uid = new ShortUniqueId({ length: 20 });
  return uid.rnd();
}

const shortUniqueKeyUtil = {
  generate
};
export default shortUniqueKeyUtil;