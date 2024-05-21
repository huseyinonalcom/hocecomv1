import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";

const Shelves: CollectionConfig = {
  slug: "shelves",
  admin: {
    useAsTitle: "product",
  },
  access: {
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
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies", required: true },
    { name: "establishment", type: "relationship", relationTo: "establishments", hasMany: false, required: true },
    { name: "product", type: "relationship", relationTo: "products", hasMany: false, required: true },
    { name: "stock", type: "number", defaultValue: 0 },
    { name: "region", type: "text", defaultValue: "0" },
    { name: "stack", type: "text", defaultValue: "0" },
    { name: "level", type: "text", defaultValue: "0" },
  ],
};

export default Shelves;
