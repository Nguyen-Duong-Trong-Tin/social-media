const jwt = require("jsonwebtoken");

const accountGenerate = (
  accountId: string,
  roleId: string,
  expiresIn: string
) => {
  return jwt.sign(
    { accountId, roleId },
    process.env.TOKEN_SECRET as string,
    { expiresIn }
  );
}

const accountVerify = (token: string) => {
  const verify: {
    success: boolean;
    account: { accountId: string, roleId: string }
  } = {
    success: false,
    account: { accountId: "", roleId: "" }
  };

  jwt.verify(
    token,
    process.env.TOKEN_SECRET as string,
    (err: Error, account: { accountId: string, roleId: string }) => {
      if (err) {
        return;
      }

      verify.success = true;
      verify.account = account;
    }
  );

  return verify;
}

const jwtUtil = {
  accountGenerate,
  accountVerify
};
export default jwtUtil;