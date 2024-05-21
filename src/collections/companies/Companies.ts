import { CollectionConfig } from "payload/types";

const Companies: CollectionConfig = {
  slug: "companies",
  admin: {
    useAsTitle: "name",
  },
  access: {
    create: ({ req }) => req.user.role === "super_admin",
  },
  fields: [
    { name: "name", type: "text" },
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
