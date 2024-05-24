import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";
import { fieldSelectionHook } from "../hooks/field-selection-hook";

const Addresses: CollectionConfig = {
  slug: "addresses",
  admin: {
    useAsTitle: "street",
  },
  hooks: {
    beforeOperation: [setCompanyHook],
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
    { name: "establishment", type: "relationship", hasMany: false, relationTo: "establishments" },
    { name: "customer", type: "relationship", hasMany: false, relationTo: "users" },
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies", required: true },
    { name: "street", type: "text", required: true },
    { name: "door", type: "text", required: true },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    { name: "floor", type: "text" },
    { name: "zip", type: "text", required: true },
    { name: "city", type: "text" },
    { name: "province", type: "text" },
    { name: "country", type: "text", required: true },
    { name: "name", type: "text" },
    { name: "isDefault", type: "checkbox", defaultValue: false },
  ],
};

export default Addresses;
