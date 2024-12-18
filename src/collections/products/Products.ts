import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";
import { checkRole } from "../hooks/checkRole";

const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "name",
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
    delete: ({ req }) => isSuperAdmin({ req }),
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "description", type: "textarea" },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    { name: "EAN", type: "text" },
    { name: "internalCode", type: "text" },
    { name: "priceBeforeDiscount", type: "number" },
    { name: "value", type: "number", required: true },
    { name: "tax", type: "number", required: true },
    { name: "dymamicPrice", type: "number" },
    { name: "unit", type: "text" },
    {
      name: "categories",
      type: "relationship",
      relationTo: "product-categories",
      hasMany: true,
      index: true,
    },
    {
      name: "buyPrice",
      type: "number",
      access: {
        read: ({ req }) => {
          if (isSuperAdmin({ req })) {
            return true;
          } else if (checkRole(["admin", "employee"], req.user)) {
            return true;
          } else {
            return false;
          }
        },
      },
    },
    { name: "extraFields", type: "json" },
    {
      name: "productImages",
      type: "relationship",
      hasMany: true,
      relationTo: "product-images",
    },
    {
      name: "shelves",
      type: "relationship",
      hasMany: true,
      relationTo: "shelves",
    },
    { name: "minStock", type: "number", defaultValue: 0 },
    { name: "minOrderAmount", type: "number", defaultValue: 1 },
    {
      name: "supplier",
      type: "relationship",
      relationTo: "suppliers",
      hasMany: false,
    },
    {
      name: "discountRange",
      type: "number",
      required: true,
      defaultValue: 10,
      access: {
        read: ({ req }) => {
          if (isSuperAdmin({ req })) {
            return true;
          } else if (checkRole(["admin", "employee"], req.user)) {
            return true;
          } else {
            return false;
          }
        },
      },
    },
    { name: "isActive", type: "checkbox", defaultValue: false },
    // company relation is always required
    {
      name: "company",
      type: "relationship",
      hasMany: false,
      relationTo: "companies",
    },
  ],
};

export default Products;
