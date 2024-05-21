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
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies" },
    { name: "establishment", type: "relationship", relationTo: "establishments", hasMany: false },
    { name: "product", type: "relationship", relationTo: "products", hasMany: false },
    { name: "stock", type: "number" },
    { name: "region", type: "text" },
    { name: "stack", type: "text" },
    { name: "level", type: "text" },
  ],
};

export default Shelves;
