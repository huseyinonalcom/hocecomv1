import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";

const Establishments: CollectionConfig = {
  slug: "establishments",
  admin: {
    useAsTitle: "name",
  },
  hooks: {
    beforeOperation: [setCompanyHook],
  },
  access: {
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
    { name: "name", type: "text", required: true },
    { name: "logo", type: "relationship", hasMany: false, relationTo: "logos" },
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies", required: true },
    { name: "users", type: "relationship", hasMany: true, relationTo: "users" },
    {
      name: "addresses",
      type: "relationship",
      hasMany: true,
      relationTo: "addresses",
    },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    {
      name: "documents",
      type: "relationship",
      hasMany: true,
      relationTo: "documents",
    },
    {
      name: "category",
      type: "select",
      required: true,
      options: [
        {
          label: "Storefront",
          value: "storefront",
        },
        {
          label: "Warehouse",
          value: "warehouse",
        },
      ],
    },
  ],
};

export default Establishments;
