import { EAccountStatus } from "../enums/account.enum";

interface IAccount {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  avatar: string;
  status: EAccountStatus;
  roleId: string;
  createdBy: {
    accountId: string;
    createdAt: Date;
  },
  updatedBy: {
    accountId: string;
    updatedAt: Date;
  }[],
  deleted: boolean;
  deletedBy: {
    accountId: string;
    deletedAt: Date;
  }
};

export default IAccount;