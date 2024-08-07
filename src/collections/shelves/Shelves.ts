import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { fieldSelectionHook } from "../hooks/field-selection-hook";
import { setCompanyHook } from "../hooks/setCompany";

const Shelves: CollectionConfig = {
  slug: "shelves",
  admin: {
    useAsTitle: "product",
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
    { name: "establishment", type: "relationship", relationTo: "establishments", hasMany: false, required: true },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    { name: "product", type: "relationship", relationTo: "products", hasMany: false, required: true },
    { name: "stock", type: "number", defaultValue: 0 },
    { name: "region", type: "text", defaultValue: "0" },
    { name: "stack", type: "text", defaultValue: "0" },
    { name: "level", type: "text", defaultValue: "0" },
    // company relation is always required
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies", required: true },
  ],
};

export default Shelves;
