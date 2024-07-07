import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";

const Logos: CollectionConfig = {
  slug: "logos",
  upload: {
    disableLocalStorage: true,
    staticURL: "https://d3bocqotv3jto7.cloudfront.net",
    staticDir: "logos",
    mimeTypes: ["image/*"],
  },
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
    delete: ({ req }) => isSuperAdmin({ req }),
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
    // company relationship is always required
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies", required: true },
  ],
};

export default Logos;
