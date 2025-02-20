import AccountModel from "../../models/account.model"

const login = async (email: string, password: string) => {
  const accountExists = await AccountModel.findOne({
    email,
    password,
    deleted: false,
    status: "active"
  });
  return accountExists;
}

const authService = {
  login
};
export default authService;