import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";

const TaskComments: CollectionConfig = {
  slug: "task-comments",
  admin: {
    useAsTitle: "comment",
  },
  hooks: {
    beforeChange: [setCompanyHook],
  },
  access: {
    create: ({ req }) => {
      if (isSuperAdmin({ req })) {
        return true;
      } else {
        return {
          company: {
            equals: req.user.company?.id ?? req.user.company,
          },
        };
      }
    },
    read: ({ req }) => {
      if (isSuperAdmin({ req })) {
        return true;
      } else {
        return {
          company: {
            equals: req.user.company?.id ?? req.user.company,
          },
        };
      }
    },
    update: ({ req }) => {
      if (isSuperAdmin({ req })) {
        return true;
      } else {
        return {
          company: {
            equals: req.user.company?.id ?? req.user.company,
          },
        };
      }
    },
    delete: () => {
      return false;
    },
  },
  fields: [
    { name: "date", type: "date", required: true },
    { name: "comment", type: "text" },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    // relations
    { name: "task", type: "relationship", hasMany: false, relationTo: "tasks" },
    {
      name: "creator",
      type: "relationship",
      hasMany: false,
      relationTo: "users",
    },
    // company relation is always required
    {
      name: "company",
      type: "relationship",
      hasMany: false,
      relationTo: "companies",
    },
  ],
};

export default TaskComments;
