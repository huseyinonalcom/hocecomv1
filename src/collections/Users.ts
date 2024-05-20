import { CollectionConfig } from "payload/types";

const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
  },
  fields: [
    { name: "establishment", type: "relationship", hasMany: true, relationTo: "establishments" },
    {
      name: "firstName",
      type: "text",
    },
    {
      name: "lastName",
      type: "text",
    },
    {
      name: "role",
      type: "select",
      options: [
        {
          label: "Super Admin",
          value: "super_admin",
        },
        {
          label: "Admin",
          value: "admin",
        },
        {
          label: "User",
          value: "user",
        },
        {
          label: "Customer",
          value: "customer",
        },
      ],
    },
  ],
};

export default Users;
