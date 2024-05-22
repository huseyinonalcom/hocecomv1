import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";

const Payments: CollectionConfig = {
  slug: "payments",
  admin: {
    useAsTitle: "category",
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
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies", required: true },
    { name: "establishment", type: "relationship", hasMany: false, relationTo: "establishments", required: true },
    { name: "customer", type: "relationship", hasMany: false, relationTo: "users", required: true },
    { name: "creator", type: "relationship", hasMany: false, relationTo: "users" },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    { name: "isVerified", type: "checkbox", defaultValue: false },
    { name: "value", type: "number", required: true },
    { name: "date", type: "date", required: true },
    { name: "reference", type: "text" },
    { name: "document", type: "relationship", hasMany: false, relationTo: "documents" },
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        {
          label: "Cash",
          value: "cash",
        },
        {
          label: "Debit Card",
          value: "debit_card",
        },
        {
          label: "Credit Card",
          value: "credit_card",
        },
        {
          label: "Online Payment",
          value: "online",
        },
        {
          label: "Bank Transfer",
          value: "bank_transfer",
        },
        {
          label: "Financing",
          value: "financing",
        },
      ],
    },
  ],
};

export default Payments;
