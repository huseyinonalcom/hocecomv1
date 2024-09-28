import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";

const SupportTickets: CollectionConfig = {
  slug: "support-tickets",
  admin: {
    useAsTitle: "document",
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
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    { name: "openDate", type: "date", required: true },
    { name: "closedDate", type: "date", required: false },
    {
      name: "document",
      type: "relationship",
      hasMany: false,
      relationTo: "documents",
    },
    { name: "notes", type: "textarea" },
    // company relation is always required
    {
      name: "company",
      type: "relationship",
      hasMany: false,
      relationTo: "companies",
    },
  ],
};

export default SupportTickets;
