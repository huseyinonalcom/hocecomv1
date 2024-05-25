import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";
import { fieldSelectionHook } from "../hooks/field-selection-hook";

const SupportTicketMessages: CollectionConfig = {
  slug: "support-ticket-messages",
  admin: {
    useAsTitle: "support-ticket",
  },
  hooks: {
    beforeOperation: [setCompanyHook],
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
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies", required: true },
    { name: "supportTicket", type: "relationship", hasMany: false, relationTo: "support-tickets", required: true },
    { name: "creator", type: "relationship", hasMany: false, relationTo: "users", required: true },
    { name: "supplierOrderProducts", type: "relationship", hasMany: true, relationTo: "supplier-order-products" },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    { name: "date", type: "date", required: true },
    { name: "notes", type: "textarea" },
    { name: "reference", type: "text" },
  ],
};

export default SupportTicketMessages;
