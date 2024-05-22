import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";

const DocumentProducts: CollectionConfig = {
  slug: "documentProducts",
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
      } else if (req.user.role === "admin" || req.user.role === "employee") {
        return {
          company: {
            equals: req.user.company.id,
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
            equals: req.user.company.id,
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
            equals: req.user.company.id,
          },
        };
      } else {
        return false;
      }
    },
  },
  fields: [
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies", required: true },
    { name: "establishment", type: "relationship", hasMany: false, relationTo: "establishments", required: true },
    { name: "customer", type: "relationship", hasMany: false, relationTo: "users", required: true },
    { name: "products", type: "relationship", hasMany: false, relationTo: "products" },
    { name: "prefix", type: "text" },
    { name: "value", type: "number", required: true },
    { name: "quantity", type: "number", required: true },
    { name: "tax", type: "number", required: true },
    { name: "reduction", type: "number", defaultValue: 0 },
    { name: "document", type: "relationship", hasMany: false, relationTo: "documents", required: true },
    { name: "name", type: "text", required: true },
    { name: "description", type: "text" },
    {
      name: "subTotal",
      type: "number",
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            delete siblingData["total"];
          },
        ],
        afterRead: [
          ({ data }) => {
            return data.quantity * (data.value * (1 - data.reduction / 100));
          },
        ],
      },
    },
    {
      name: "subTotalTax",
      type: "number",
      admin: { hidden: true },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            delete siblingData["subTotalTax"];
          },
        ],
        afterRead: [
          ({ data }) => {
            return data.subTotal - data.subTotal / (data.tax / 100 + 1);
          },
        ],
      },
    },
  ],
};

export default DocumentProducts;
