interface IRole {
  title: string;
  description: string;
  permission: string[];
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

export default IRole;