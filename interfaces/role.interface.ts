interface IRole {
  title: string;
  slug: string;
  description: string;
  permissions: string[];
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