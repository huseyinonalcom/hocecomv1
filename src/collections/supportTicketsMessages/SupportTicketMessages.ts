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
    { name: "supportTicket", type: "relationship", hasMany: false, relationTo: "support-tickets", required: true },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    { name: "date", type: "date", required: true },
    { name: "message", type: "textarea" },
    { name: "creator", type: "relationship", hasMany: false, relationTo: "users", required: true },
    // company relation is always required
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies", required: true },
  ],
};

export default SupportTicketMessages;
