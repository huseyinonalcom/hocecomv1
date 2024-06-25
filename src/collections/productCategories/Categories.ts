import { CollectionConfig } from "payload/types";
import { setCompanyHook } from "../hooks/setCompany";
import isSuperAdmin from "../users/access/superAdminCheck";
import { fieldSelectionHook } from "../hooks/field-selection-hook";
import { adminCheck } from "../access/adminCheck";

const ProductCategories: CollectionConfig = {
  slug: "product-categories",
  admin: {
    useAsTitle: "name",
  },
  hooks: {
    beforeOperation: [setCompanyHook],
    afterRead: [fieldSelectionHook],
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
      if (adminCheck({ req })) {
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
    delete: ({ req }) => adminCheck({ req }),
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "description", type: "textarea" },
    { name: "priority", type: "number", required: true, defaultValue: 0 },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    // relations
    {
      name: "headCategory",
      type: "relationship",
      relationTo: "product-categories",
      hasMany: false,
    },
    {
      name: "categoryImage",
      type: "relationship",
      relationTo: "product-images",
      hasMany: false,
    },
    {
      name: "promos",
      type: "relationship",
      relationTo: "product-promos",
      hasMany: true,
    },
    {
      name: "products",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
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

export default ProductCategories;
