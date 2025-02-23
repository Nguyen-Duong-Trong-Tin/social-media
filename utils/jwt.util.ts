const jwt = require("jsonwebtoken");

const accountGenerate = (
  accountId: string,
  permissions: string[],
  expiresIn: string
) => {
  return jwt.sign(
    { accountId, permissions },
    process.env.TOKEN_SECRET as string,
    { expiresIn }
  );
}

const accountVerify = (token: string) => {
  const verify: {
    success: boolean;
    account: { accountId: string, permissions: string[] }
  } = {
    success: false,
    account: { accountId: "", permissions: [] }
  };

  jwt.verify(
    token,
    process.env.TOKEN_SECRET as string,
    (err: Error, account: { accountId: string, permissions: string[] }) => {
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