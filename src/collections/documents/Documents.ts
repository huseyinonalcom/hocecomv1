import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";
import { fieldSelectionHook } from "../hooks/field-selection-hook";
import payload from "payload";

const Documents: CollectionConfig = {
  slug: "documents",
  admin: {
    useAsTitle: "category",
  },
  hooks: {
    beforeOperation: [setCompanyHook],
  },
  endpoints: [
    {
      path: "/generate-number",
      method: "get",
      handler: async (req, res) => {
        try {
          const { type } = req.query;

          if (!type) {
            res.status(400).send({ error: "type required" });
            return;
          }

          const documents = await payload.find({
            collection: "documents",
            depth: 2,
            overrideAccess: true,
            where: {
              type: {
                equals: type,
              },
              company: {
                equals: req.user.company,
              },
            },
            limit: 1,
            sort: "-number",
          });

          const lastDocument = documents.docs[0];

          console.log("lastDocument", lastDocument);

          if (!lastDocument) {
            res.status(200).send({ number: 1 });
            return;
          }

          res.status(200).send({ number: Number(lastDocument.number) + 1 });
        } catch (error) {
          console.error(error);
          res.status(500).send({ error });
        }
      },
    },
  ],
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
    { name: "number", type: "text", required: true },
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
    { name: "prefix", type: "text", required: true },
    { name: "date", type: "date", required: true },
    { name: "phase", type: "number", defaultValue: 0 },
    { name: "files", type: "relationship", hasMany: true, relationTo: "files" },
    { name: "comments", type: "textarea" },
    { name: "references", type: "textarea" },
    { name: "notes", type: "textarea" },
    { name: "managerNotes", type: "textarea" },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    { name: "decisionMaker", type: "text" },
    // relations
    {
      name: "supplier",
      type: "relationship",
      hasMany: false,
      relationTo: "suppliers",
      required: false,
    },
    {
      name: "customer",
      type: "relationship",
      hasMany: false,
      relationTo: "users",
      required: true,
    },
    {
      name: "establishment",
      type: "relationship",
      hasMany: false,
      relationTo: "establishments",
    },
    {
      name: "documentProducts",
      type: "relationship",
      hasMany: true,
      relationTo: "document-products",
      required: true,
    },
    {
      name: "payments",
      type: "relationship",
      hasMany: true,
      relationTo: "payments",
    },
    {
      name: "supportTickets",
      type: "relationship",
      hasMany: true,
      relationTo: "support-tickets",
    },
    { name: "tasks", type: "relationship", hasMany: true, relationTo: "tasks" },
    {
      name: "toDocument",
      type: "relationship",
      hasMany: false,
      relationTo: "documents",
    },
    {
      name: "fromDocument",
      type: "relationship",
      hasMany: false,
      relationTo: "documents",
    },
    {
      name: "docAddress",
      type: "relationship",
      hasMany: false,
      relationTo: "addresses",
      required: true,
    },
    {
      name: "delAddress",
      type: "relationship",
      hasMany: false,
      relationTo: "addresses",
      required: true,
    },
    {
      name: "creator",
      type: "relationship",
      hasMany: false,
      relationTo: "users",
      required: true,
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

export default Documents;
