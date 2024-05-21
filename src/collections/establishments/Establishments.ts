import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";

const Establishments: CollectionConfig = {
  slug: "establishments",
  admin: {
    useAsTitle: "name",
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
    { name: "name", type: "text" },
    { name: "logo", type: "relationship", hasMany: false, relationTo: "logos" },
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies" },
    { name: "users", type: "relationship", hasMany: true, relationTo: "users" },
  ],
};

export default Establishments;
