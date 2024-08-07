import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";
import { fieldSelectionHook } from "../hooks/field-selection-hook";

const Tasks: CollectionConfig = {
  slug: "tasks",
  admin: {
    useAsTitle: "category",
  },
  hooks: {
    beforeChange: [setCompanyHook],
    // afterRead: [fieldSelectionHook],
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
    {
      name: "creator",
      type: "relationship",
      hasMany: false,
      relationTo: "users",
    },
    {
      name: "assignee",
      type: "relationship",
      hasMany: false,
      relationTo: "users",
    },
    { name: "category", type: "text", required: true },
    { name: "description", type: "textarea" },
    { name: "isCompleted", type: "checkbox", defaultValue: false },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    { name: "date", type: "date", required: true },
    { name: "dateCreated", type: "date", required: true },
    { name: "notes", type: "textarea" },
    {
      name: "document",
      type: "relationship",
      hasMany: false,
      relationTo: "documents",
    },
    { name: "files", type: "relationship", hasMany: true, relationTo: "files" },
    {
      name: "taskComments",
      type: "relationship",
      hasMany: true,
      relationTo: "task-comments",
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

export default Tasks;
