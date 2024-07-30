import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";
import { fieldSelectionHook } from "../hooks/field-selection-hook";
import payload from "payload";

const DocumentProducts: CollectionConfig = {
  slug: "document-products",
  admin: {
    useAsTitle: "name",
  },
  hooks: {
    beforeChange: [setCompanyHook],
    // afterRead: [fieldSelectionHook],
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
        return true;
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
    { name: "name", type: "text", required: true },
    { name: "description", type: "text" },
    { name: "value", type: "number", required: true },
    { name: "reduction", type: "number", defaultValue: 0 },
    { name: "amount", type: "number", required: true },
    { name: "tax", type: "number", required: true },
    // relations
    {
      name: "product",
      type: "relationship",
      hasMany: false,
      relationTo: "products",
    },
    {
      name: "customer",
      type: "relationship",
      hasMany: false,
      relationTo: "users",
    },
    {
      name: "document",
      type: "relationship",
      hasMany: false,
      relationTo: "documents",
    },
    // calculated fields
    {
      name: "subTotal",
      type: "number",
      admin: {
        hidden: true,
      },
      access: {
        create: () => false,
        update: () => false,
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            delete siblingData["subTotal"];
          },
        ],
        afterRead: [
          async ({ data }) => {
            try {
              const document = await payload.find({
                collection: "documents",
                where: {
                  documentProducts: {
                    contains: data.id,
                  },
                },
              });

              if (document.docs.at(0).taxIncluded) {
                return (
                  data.amount *
                  (data.value * (1 - data.reduction / 100))
                ).toFixed(2);
              } else {
                return (
                  data.amount * (data.value * (1 - data.reduction / 100)) +
                  data.amount *
                    (data.value * (1 - data.reduction / 100)) *
                    (data.tax / 100)
                ).toFixed(2);
              }
            } catch (error) {
              console.error(error);
              return (
                data.amount *
                (data.value * (1 - data.reduction / 100))
              ).toFixed(2);
            }
          },
        ],
      },
    },
    {
      name: "subTotalTax",
      type: "number",
      admin: { hidden: true },
      access: {
        create: () => false,
        update: () => false,
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            delete siblingData["subTotalTax"];
          },
        ],
        afterRead: [
          async ({ data }) => {
            try {
              const document = await payload.find({
                collection: "documents",
                where: {
                  documentProducts: {
                    contains: data.id,
                  },
                },
              });

              if (document.docs.at(0).taxIncluded) {
                return (
                  data.amount * (data.value * (1 - data.reduction / 100)) -
                  (data.amount * (data.value * (1 - data.reduction / 100))) /
                    (data.tax / 100 + 1)
                ).toFixed(2);
              } else {
                return (
                  data.amount *
                  (data.value * (1 - data.reduction / 100)) *
                  (data.tax / 100)
                ).toFixed(2);
              }
            } catch (error) {
              console.error(error);
              return (
                data.amount * (data.value * (1 - data.reduction / 100)) -
                (data.amount * (data.value * (1 - data.reduction / 100))) /
                  (data.tax / 100 + 1)
              ).toFixed(2);
            }
          },
        ],
      },
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

export default DocumentProducts;
