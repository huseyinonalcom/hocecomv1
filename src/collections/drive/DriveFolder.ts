import { CollectionConfig } from "payload/types";
import { setCompanyHook } from "../hooks/setCompany";
import isSuperAdmin from "../users/access/superAdminCheck";
import { fieldSelectionHook } from "../hooks/field-selection-hook";

const DriveFolders: CollectionConfig = {
  slug: "drive-folders",
  upload: {
    disableLocalStorage: true,
    staticURL: "https://d3bocqotv3jto7.cloudfront.net",
    staticDir: "name",
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
  admin: {
    useAsTitle: "name",
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "priority", type: "number", defaultValue: 0 },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    { name: "files", type: "relationship", relationTo: "drive-files", hasMany: false, required: false },
    { name: "parentFolder", type: "relationship", relationTo: "drive-folders", hasMany: false, required: false },
    // company relationship is always required
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies", required: true },
  ],
};

export default DriveFolders;
