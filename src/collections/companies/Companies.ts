import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";
import { fieldSelectionHook } from "../hooks/field-selection-hook";
import { adminCheck } from "../access/adminCheck";
import { websiteCheck } from "../access/websiteCheck";
import { companyCheck } from "../access/companyCheck";
import { customerCheck } from "../access/customerCheck";

const Companies: CollectionConfig = {
  slug: "companies",
  admin: {
    useAsTitle: "name",
  },
  hooks: {
    beforeOperation: [setCompanyHook],
    // afterRead: [fieldSelectionHook],
  },
  access: {
    create: isSuperAdmin,
    read: adminCheck || websiteCheck || companyCheck || customerCheck,
    delete: () => false,
    update: adminCheck,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "logo", type: "relationship", hasMany: false, relationTo: "logos" },
    {
      name: "active",
      type: "checkbox",
      access: {
        update: ({ req }) => req.user.role === "super_admin",
      },
      defaultValue: false,
    },
  ],
};

export default Companies;
