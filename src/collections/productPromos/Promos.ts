import { CollectionConfig } from "payload/types";
import { setCompanyHook } from "../hooks/setCompany";
import isSuperAdmin from "../users/access/superAdminCheck";

const ProductPromos: CollectionConfig = {
  slug: "product-promos",
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
    delete: () => {
      return false;
    },
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "promoCode", type: "text", required: true },
    { name: "calculation", type: "json", required: true },
    { name: "products", type: "relationship", relationTo: "products", hasMany: true },
    { name: "categories", type: "relationship", relationTo: "product-categories", hasMany: true },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    { name: "isActive", type: "checkbox", defaultValue: false },
    { name: "startDate", type: "date", required: true },
    { name: "endDate", type: "date", required: true },
    { name: "customers", type: "relationship", relationTo: "users", hasMany: true },
    { name: "creator", type: "relationship", relationTo: "users", hasMany: false, required: true },
    // company relation is awlways required
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies", required: true },
  ],
};

export default ProductPromos;
