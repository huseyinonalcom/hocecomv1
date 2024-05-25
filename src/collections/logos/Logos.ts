import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";
import { fieldSelectionHook } from "../hooks/field-selection-hook";

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
    {
      name: "name",
      type: "text",
    },
    // company relationship is always required
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies", required: true },
  ],
};

export default Logos;
