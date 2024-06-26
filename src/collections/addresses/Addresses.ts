import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";
import { fieldSelectionHook } from "../hooks/field-selection-hook";
import { checkRole } from "../hooks/checkRole";

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
    create: ({}) => true,
    read: ({ req }) => {
      if (isSuperAdmin({ req })) {
        return true;
      } else if (checkRole(["admin", "employee", "website"], req.user)) {
        return {
          company: {
            equals: req.user.company.id,
          },
        };
      } else if (checkRole(["customer"], req.user)) {
        return {
          customer: {
            equals: req.user.id,
          },
        };
      } else {
        return false;
      }
    },
    update: ({}) => false,
    delete: ({}) => false,
  },
  fields: [
    { name: "country", type: "text", required: true },
    { name: "street", type: "text", required: true },
    { name: "door", type: "text", required: true },
    { name: "zip", type: "text", required: true },
    { name: "floor", type: "text" },
    { name: "city", type: "text" },
    { name: "province", type: "text" },
    { name: "name", type: "text" },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    { name: "isDefault", type: "checkbox", defaultValue: false },
    // relationships
    {
      name: "customer",
      type: "relationship",
      hasMany: false,
      relationTo: "users",
    },
    {
      name: "supplier",
      type: "relationship",
      hasMany: false,
      relationTo: "suppliers",
    },
    {
      name: "establishment",
      type: "relationship",
      hasMany: false,
      relationTo: "establishments",
    },
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
      required: true,
    },
  ],
};

export default Addresses;
