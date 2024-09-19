import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";
import payload from "payload";
import { Company } from "payload/generated-types";

const Payments: CollectionConfig = {
  slug: "payments",
  admin: {
    useAsTitle: "type", 
  },
  hooks: {
    beforeChange: [setCompanyHook],
  },
  endpoints: [
    {
      path: "/stripe-payment-link",
      method: "post",
      handler: async (req, res, next) => {
        try {
          const documentID: number = Number(req.query.document);
          if (!documentID) {
            res.status(400).send({ error: "document id is required" });
            return;
          }
          const returnURL: string = req.query.return as string;
          const document = await payload.findByID({
            collection: "documents",
            id: documentID,
            depth: 5,
            overrideAccess: true,
          });

          const company = await payload.findByID({
            collection: "companies",
            id: (document.company as Company).id,
            depth: 3,
            overrideAccess: true,
          });

          const stripe = require("stripe")(company.stripeSecretKey);

          let unitAmount = 0;

          for (let i = 0; i < document.documentProducts.length; i++) {
            unitAmount += parseFloat(document.documentProducts[i].subTotal);
          }

          unitAmount = unitAmount * 100;

          const price = await stripe.prices.create({
            currency: "eur",
            unit_amount: unitAmount.toFixed(0),
            product_data: {
              name: "Bestelling " + document.prefix + document.number,
            },
          });

          const paymentLink = await stripe.paymentLinks.create({
            line_items: [
              {
                price: price.id,
                quantity: 1,
              },
            ],
            after_completion: {
              type: "redirect",
              redirect: {
                url: returnURL, // Deep link to your app
              },
            },
          });

          console.log(paymentLink);

          res.status(200).send({ url: paymentLink.url });
        } catch (error) {
          console.log(error);
          res.status(500).send({ error: "An error occurred" });
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
    { name: "value", type: "number", required: true },
    { name: "date", type: "date", required: true },
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
        {
          label: "Financing Unverified",
          value: "financing_unverified",
        },
      ],
    },
    { name: "notes", type: "text" },
    { name: "reference", type: "text" },
    { name: "isVerified", type: "checkbox", defaultValue: false },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    // relationships
    {
      name: "document",
      type: "relationship",
      hasMany: false,
      relationTo: "documents",
      required: true,
    },
    {
      name: "creator",
      type: "relationship",
      hasMany: false,
      relationTo: "users",
    },
    {
      name: "establishment",
      type: "relationship",
      hasMany: false,
      relationTo: "establishments",
      required: true,
    },
    // company relationship is always required
    {
      name: "company",
      type: "relationship",
      hasMany: false,
      relationTo: "companies",
      required: true,
    },
  ],
};

export default Payments;
