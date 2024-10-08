import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";

const Establishments: CollectionConfig = {
  slug: "establishments",
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
    {
      name: "documents",
      type: "relationship",
      hasMany: true,
      relationTo: "documents",
    },
    {
      name: "deliveries",
      type: "relationship",
      hasMany: true,
      relationTo: "deliveries",
    },
    {
      name: "supplierOrders",
      type: "relationship",
      hasMany: true,
      relationTo: "supplier-orders",
    },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    { name: "phone", type: "text" },
    { name: "phone2", type: "text" },
    { name: "taxID", type: "text" },
    { name: "bankAccount1", type: "text" },
    { name: "bankAccount2", type: "text" },
    { name: "bankAccount3", type: "text" },
    { name: "extraFields", type: "json" },
    {
      name: "category",
      type: "select",
      required: true,
      options: [
        {
          label: "Storefront",
          value: "storefront",
        },
        {
          label: "Warehouse",
          value: "warehouse",
        },
      ],
    },
    {
      name: "address",
      type: "relationship",
      hasMany: false,
      relationTo: "addresses",
    },
    {
      name: "shelves",
      type: "relationship",
      hasMany: true,
      relationTo: "shelves",
    },
    { name: "logo", type: "relationship", hasMany: false, relationTo: "logos" },
    { name: "users", type: "relationship", hasMany: true, relationTo: "users" },
    {
      name: "customers",
      type: "relationship",
      hasMany: true,
      relationTo: "users",
    },
    // company relation is always required
    {
      name: "company",
      type: "relationship",
      hasMany: false,
     relationTo: "companies",
    },
  ],
};

export default Establishments;
