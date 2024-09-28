import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";

const SupportTicketMessages: CollectionConfig = {
  slug: "support-ticket-messages",
  admin: {
    useAsTitle: "support-ticket",
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
    { name: "supportTicket", type: "relationship", hasMany: false, relationTo: "support-tickets" },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    { name: "date", type: "date", required: true },
    { name: "message", type: "textarea" },
    { name: "creator", type: "relationship", hasMany: false, relationTo: "users" },
    // company relation is always required
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies" },
  ],
};

export default SupportTicketMessages;
