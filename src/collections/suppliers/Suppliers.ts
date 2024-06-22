import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";
import { fieldSelectionHook } from "../hooks/field-selection-hook";

const Suppliers: CollectionConfig = {
  slug: "suppliers",
  admin: {
    useAsTitle: "name",
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
    { name: "name", type: "text", required: true },
    { name: "logo", type: "relationship", hasMany: false, relationTo: "logos" },
    {
      name: "addresses",
      type: "relationship",
      hasMany: true,
      relationTo: "addresses",
    },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    {
      name: "supplierOrders",
      type: "relationship",
      hasMany: true,
      relationTo: "supplier-orders",
    },
    {
      name: "category",
      type: "text",
      required: true,
    },
    {
      name: "products",
      type: "relationship",
      hasMany: true,
      relationTo: "products",
    },
    { name: "phone", type: "text" },
    { name: "orderMail", type: "text" },
    { name: "contactMail", type: "text" },
    { name: "orderTime", type: "number" },
    {
      name: "products",
      type: "relationship",
      hasMany: true,
      relationTo: "products",
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

export default Suppliers;
