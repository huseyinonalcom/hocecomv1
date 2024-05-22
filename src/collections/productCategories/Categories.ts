import { CollectionConfig } from "payload/types";
import { setCompanyHook } from "../hooks/setCompany";
import isSuperAdmin from "../users/access/superAdminCheck";

const ProductCategories: CollectionConfig = {
  slug: "productCategories",
  admin: {
    useAsTitle: "name",
  },
  hooks: {
    beforeOperation: [setCompanyHook],
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
    { name: "description", type: "textarea" },
    { name: "headCategory", type: "relationship", relationTo: "productCategories", hasMany: false },
    { name: "subCategories", type: "relationship", relationTo: "productCategories", hasMany: true },
    { name: "categoryImage", type: "relationship", relationTo: "productImages", hasMany: false },
    { name: "products", type: "relationship", relationTo: "products", hasMany: true },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies", required: true },
  ],
};

export default ProductCategories;
