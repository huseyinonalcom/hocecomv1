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
            equals: req.user.company.id,
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
            equals: req.user.company.id,
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
            equals: req.user.company.id,
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
      required: true,
    },
    // company relation is always required
    {
      name: "company",
      type: "relationship",
      hasMany: false,
      relationTo: "companies",
      required: true,
    },
  ],
};

export default TaskComments;
