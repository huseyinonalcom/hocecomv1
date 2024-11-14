import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";
import payload from "payload";
import { checkRole } from "../hooks/checkRole";
import APIError from "payload/dist/errors/APIError";
import { Document } from "payload/generated-types";
import sendDocumentMail from "../../hooks/senddocumentmail";

const Documents: CollectionConfig = {
  slug: "documents",
  admin: {
    useAsTitle: "type",
  },
  hooks: {
    beforeChange: [
      setCompanyHook,
      async ({ operation, data }) => {
        if (operation == "create") {
          if (!data.type) {
            throw new APIError("type required", 400);
          }

          try {
            const documents = await payload.find({
              collection: "documents",
              depth: 2,
              overrideAccess: true,
              where: {
                type: {
                  equals: data.type,
                },
                company: {
                  equals: data.company,
                },
                isDeleted: {
                  equals: false,
                },
              },
              limit: 1,
              sort: "-number",
            });

            const lastDocument = documents.docs[0] as unknown as Document;

            const year = new Date().getFullYear().toString();
            if (!lastDocument) {
              data.number = year + "0000001";
            } else {
              // number looks like 202400000001
              // we need to increment the number by 1
              // and make sure the first 4 digits are the current year
              // and the total length is 11
              data.number = year + (Number(lastDocument.number.slice(4)) + 1).toString().padStart(7, "0");
            }
          } catch (error) {
            const year = new Date().getFullYear().toString();
            data.number = year + "0000001";
          }
        }
      },
    ],
    afterChange: [sendDocumentMail],
    beforeOperation: [
      ({ operation, args }) => {
        if (operation == "read") {
          if (args.req.query?.sort?.date == "desc") {
            delete args.req.query.sort.date;
          }
        }
        return args;
      },
    ],
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
                equals: req.user.company.id,
              },
            },
            limit: 1,
            sort: "-number",
          });

          const lastDocument = documents.docs[0];

          if (!lastDocument) {
            res.status(200).send({ number: 1 });
            return;
          }

          const number = Number(lastDocument.number) + 1;

          res.status(200).send({ number: number });
        } catch (error) {
          res.status(500).send({ error });
        }
      },
    },
    {
      path: "/boloffersub",
      method: "post",
      handler: async (req, res) => {
        res.status(200).send({ status: "success" });
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
            equals: req.user.company?.id ?? req.user.company,
          },
        };
      }
    },
    read: ({ req }) => {
      if (isSuperAdmin({ req })) {
        return true;
      } else if (checkRole(["customer"], req.user)) {
        return {
          customer: {
            equals: req.user.id,
          },
        };
      } else if (checkRole(["admin", "employee"], req.user)) {
        return {
          company: {
            equals: req.user.company?.id ?? req.user.company,
          },
        };
      } else {
        return false;
      }
    },
    update: ({ req }) => {
      if (isSuperAdmin({ req })) {
        return true;
      } else if (checkRole(["customer"], req.user)) {
        return {
          customer: {
            equals: req.user.id,
          },
        };
      } else if (checkRole(["admin", "employee"], req.user)) {
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
      } else {
        return false;
      }
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
    {
      name: "currency",
      type: "select",
      defaultValue: "EUR",
      options: [
        {
          label: "Euro",
          value: "EUR",
        },
        {
          label: "Turkish Lira",
          value: "TRY",
        },
        {
          label: "US Dollar",
          value: "USD",
        },
      ],
    },
    { name: "prefix", type: "text" },
    { name: "date", type: "date", required: true },
    { name: "deliveryDate", type: "date", required: false },
    { name: "phase", type: "number", defaultValue: 0 },
    { name: "files", type: "relationship", hasMany: true, relationTo: "files" },
    { name: "comments", type: "textarea" },
    { name: "references", type: "textarea" },
    { name: "notes", type: "textarea" },
    { name: "managerNotes", type: "textarea" },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    { name: "decisionMaker", type: "text" },
    { name: "time", type: "text" },
    // relations
    {
      name: "supplier",
      type: "relationship",
      hasMany: false,
      relationTo: "suppliers",
    },
    {
      name: "customer",
      type: "relationship",
      hasMany: false,
      relationTo: "users",
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
    },
    {
      name: "delAddress",
      type: "relationship",
      hasMany: false,
      relationTo: "addresses",
    },
    {
      name: "creator",
      type: "relationship",
      hasMany: false,
      relationTo: "users",
    },
    {
      name: "taxIncluded",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "extraFields",
      type: "json",
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

export default Documents;
