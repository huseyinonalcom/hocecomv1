import { CollectionConfig } from "payload/types";
import { setCompanyHook } from "../hooks/setCompany";
import isSuperAdmin from "../users/access/superAdminCheck";

const Files: CollectionConfig = {
  slug: "files",
  upload: {
    disableLocalStorage: true,
    staticURL: "https://d3bocqotv3jto7.cloudfront.net",
    staticDir: "files",
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
    delete: ({ req }) => isSuperAdmin({ req }),
  },
  admin: {
    useAsTitle: "name",
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "priority", type: "number", defaultValue: 0 },
    // company relationship is always required
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies" },
  ],
};

export default Files;
