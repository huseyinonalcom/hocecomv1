import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";
import { adminCheckForCompany } from "./access/adminCheck";
import { customerCheckForCompany } from "./access/customerCheck";
import { companyCheckForCompany } from "./access/companyCheck";
import { websiteCheckForCompany } from "./access/websiteCheck";
import payload from "payload";
import { checkRole } from "../hooks/checkRole";

const Companies: CollectionConfig = {
  slug: "companies",
  admin: {
    useAsTitle: "name",
  },
  hooks: {
    beforeChange: [setCompanyHook],
  },
  endpoints: [
    {
      path: "/pincheck",
      method: "get",
      handler: async (req, res) => {
        try {
          const { pin } = req.query;

          if (!pin) {
            res.status(400).send({ error: "pin is required" });
            return;
          }

          const company = await payload.find({
            collection: "companies",
            depth: 2,
            overrideAccess: true,
            where: {
              companyUUID: {
                equals: pin,
              },
            },
            limit: 1,
          });

          if (!company) {
            res.status(404).send({ error: "company not found" });
            return;
          }

          res.status(200).send({ company: company.docs[0].id });
        } catch (error) {
          res.status(500).send({ error });
        }
      },
    },
  ],
  access: {
    create: isSuperAdmin,
    read: ({ req }) => {
      if (isSuperAdmin({ req })) {
        return true;
      } else {
        return {
          id: {
            equals: req.user.company?.id ?? req.user.company,
          },
        };
      }
    },
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
    { name: "stripeSecretKey", type: "text" },
    { name: "stripePublishableKey", type: "text" },
    { name: "companyUUID", type: "text" },
    { name: "bolClientID", type: "text" },
    { name: "bolClientSecret", type: "text" },
    { name: "amazonClientID", type: "text" },
    { name: "amazonClientSecret", type: "text" },
    { name: "accountantEmail", type: "email" },
  ],
};

export default Companies;
