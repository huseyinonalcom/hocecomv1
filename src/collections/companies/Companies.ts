import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";

const Companies: CollectionConfig = {
  slug: "companies",
  admin: {
    useAsTitle: "name",
  },
  access: {
    read: ({ req }) => {
      if (isSuperAdmin({ req })) {
        return true;
      } else {
        return {
          id: {
            equals: req.user.company.id,
          },
        };
      }
    },
    create: isSuperAdmin,
    delete: () => {
      return false;
    },
    update: ({ req, id }) => req.user.role === "super_admin" || (req.user.role === "admin" && req.user.company.id == id),
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "logo", type: "relationship", hasMany: false, relationTo: "logos" },
    { name: "establishment", type: "relationship", hasMany: true, relationTo: "establishments" },
    { name: "users", type: "relationship", hasMany: true, relationTo: "users" },
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
