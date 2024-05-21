import { CollectionConfig } from "payload/types";
import isSuperAdmin from "./access/superAdminCheck";

const Users: CollectionConfig = {
  slug: "users",
  // adds email and password fields by default
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
    update: ({ req }) => {
      // super admins can update any user
      if (isSuperAdmin({ req })) {
        return true;
      } else {
        // admins can update users in their company
        if (req.user.role === "admin") {
          return {
            company: {
              equals: req.user.company.id,
            },
          };
        } else {
          // anyone can update themselves
          return {
            id: {
              equals: req.user.id,
            },
          };
        }
      }
    },
    delete: () => {
      return false;
    },
  },
  fields: [
    // email and password exist by default
    // common fields
    {
      name: "role",
      type: "select",
      required: true,
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
      required: true,
    },
    {
      name: "lastName",
      type: "text",
      required: true,
    },
    {
      name: "phone",
      type: "text",
    },
    {
      name: "isBlocked",
      type: "checkbox",
      defaultValue: false,
    },
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies", required: true },
    { name: "establishment", type: "relationship", hasMany: true, relationTo: "establishments", required: true },
    { name: "payments", type: "relationship", hasMany: true, relationTo: "payments" },
    // customer fields
    {
      name: "customerCategory",
      type: "select",
      required: true,
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
