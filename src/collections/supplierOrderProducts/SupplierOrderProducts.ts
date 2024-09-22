import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";

const SupplierOrderProducts: CollectionConfig = {
  slug: "supplier-order-products",
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
      } else if (req.user.role === "admin" || req.user.role === "employee") {
        return {
           company: {
            equals: req.user.company?.id ?? req.user.company,
          },
        };
      } else if (req.user.role === "customer") {
        return {
          customer: {
            equals: req.user.id,
          },
        };
      } else {
        return false;
      }
    },
    update: ({ req }) => {
      if (isSuperAdmin({ req })) {
        return true;
      } else if (req.user.role === "admin" || req.user.role === "employee") {
        return {
           company: {
            equals: req.user.company?.id ?? req.user.company,
          },
        };
      } else {
        return false;
      }
    },
    delete: ({ req }) => {
      if (isSuperAdmin({ req })) {
        return true;
      } else if (req.user.role === "admin" || req.user.role === "employee") {
        return {
           company: {
            equals: req.user.company?.id ?? req.user.company,
          },
        };
      } else {
        return false;
      }
    },
  },
  fields: [
    { name: "product", type: "relationship", hasMany: false, relationTo: "products" },
    { name: "quantity", type: "number", required: true },
    { name: "name", type: "text", required: true },
    { name: "description", type: "text" },
    { name: "creator", type: "relationship", relationTo: "users", hasMany: false, required: true },
    { name: "establishment", type: "relationship", hasMany: false, relationTo: "establishments", required: true },
    { name: "supplierOrder", type: "relationship", hasMany: false, relationTo: "supplier-orders", required: true },
    // company relation is always required
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies", required: true },
  ],
};

export default SupplierOrderProducts;
