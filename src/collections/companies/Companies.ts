import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";
import { adminCheck } from "../access/adminCheck";
import { adminCheckForCompany } from "./access/adminCheck";
import { customerCheckForCompany } from "./access/customerCheck";
import { companyCheckForCompany } from "./access/companyCheck";
import { websiteCheckForCompany } from "./access/websiteCheck";

const Companies: CollectionConfig = {
  slug: "companies",
  admin: {
    useAsTitle: "name",
  },
  hooks: {
    beforeChange: [setCompanyHook],
  },
  access: {
    create: isSuperAdmin,
    read:
      adminCheckForCompany ||
      websiteCheckForCompany ||
      companyCheckForCompany ||
      customerCheckForCompany,
    delete: () => false,
    update: adminCheckForCompany,
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
    { name: "emailUser", type: "email" },
    { name: "emailPassword", type: "text" },
    { name: "emailHost", type: "text" },
    { name: "emailPort", type: "number" },
    { name: "emailSec", type: "text" },
  ],
};

export default Companies;
