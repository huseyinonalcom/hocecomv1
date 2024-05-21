import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";

const Documents: CollectionConfig = {
  slug: "documents",
  auth: true,
  admin: {
    useAsTitle: "category",
  },
  access: {
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
