import { CollectionConfig } from "payload/types";
import isSuperAdmin from "./access/superAdminCheck";
import { emailPrefix } from "./hooks/emailPrefix";
import { setCompanyHook } from "../hooks/setCompany";

const Users: CollectionConfig = {
  slug: "users",
  // adds email and password fields by default
  auth: {
    useAPIKey: true,
  },
  admin: {
    useAsTitle: "email",
  },
  hooks: {
    beforeOperation: [emailPrefix, setCompanyHook],
    afterRead: [
      async ({ doc }) => {
        if (doc.company) {
          doc.email = doc.email.split("+")[1];
        }
      },
    ],
  },
  access: {
    create: ({ req }) => {
      if (isSuperAdmin({ req }) || req.user.role === "admin" || req.user.role === "website") {
        return true;
      } else {
        return false;
      }
    },
    read: ({ req }) => {
      if (isSuperAdmin({ req })) {
        console.log("super admin read access granted for users");
        return true;
      } else {
        return {
          company: {
            equals: req.user.company.id,
          },
        };
      }
    },
    update: async ({ req }) => {
      if (isSuperAdmin({ req })) {
        return true;
      } else {
        if (req.user.role === "admin") {
          return {
            company: {
              equals: req.user.company.id,
            },
          };
        } else {
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
      defaultValue: "customer",
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
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies" },
    { name: "establishment", type: "relationship", hasMany: true, relationTo: "establishments" },
    { name: "payments", type: "relationship", hasMany: true, relationTo: "payments" },
    { name: "preferredLanguage", type: "text" },
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
