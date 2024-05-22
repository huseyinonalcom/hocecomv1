import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";

const Documents: CollectionConfig = {
  slug: "documents",
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
    { name: "establishment", type: "relationship", hasMany: false, relationTo: "establishments", required: true },
    { name: "customer", type: "relationship", hasMany: false, relationTo: "users", required: true },
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies", required: true },
    { name: "creator", type: "relationship", hasMany: false, relationTo: "users", required: true },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    { name: "payments", type: "relationship", hasMany: true, relationTo: "payments" },
    { name: "number", type: "text", required: true },
    { name: "date", type: "date", required: true },
    { name: "notes", type: "textarea" },
    { name: "reference", type: "text" },
    { name: "prefix", type: "text" },
    { name: "phase", type: "number", defaultValue: 0 },
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        {
          label: "Quote",
          value: "quote",
        },
        {
          label: "Order",
          value: "order",
        },
        {
          label: "Delivery Note",
          value: "delivery_note",
        },
        {
          label: "Invoice",
          value: "invoice",
        },
        {
          label: "Credit Note",
          value: "credit_note",
        },
      ],
    },
  ],
};

export default Documents;
