import { CollectionConfig } from "payload/types";
import isSuperAdmin from "./access/superAdminCheck";

const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
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
    delete: () => {
      return false;
    },
  },
  fields: [
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies" },
    { name: "establishment", type: "relationship", hasMany: true, relationTo: "establishments" },
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
          label: "Employee",
          value: "employee",
        },
        {
          label: "Customer",
          value: "customer",
        },
      ],
    },
    {
      name: "firstName",
      type: "text",
    },
    {
      name: "lastName",
      type: "text",
    },
    {
      name: "phone",
      type: "text",
    },
    // customer fields
    {
      name: "customerCategory",
      type: "select",
      options: [
        {
          label: "Professional",
          value: "professional",
        },
        {
          label: "Private",
          value: "private",
        },
      ],
    },
    {
      name: "customerCompany",
      type: "text",
    },
    {
      name: "customerTaxNumber",
      type: "text",
    },
    {
      name: "customerAddresses",
      type: "relationship",
      hasMany: true,
      relationTo: "addresses",
    },
  ],
};

export default Users;
