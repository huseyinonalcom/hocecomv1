import { CollectionConfig } from "payload/types";
import isSuperAdmin from "./access/superAdminCheck";
import { emailPrefix } from "./hooks/emailPrefix";
import { setCompanyHook } from "../hooks/setCompany";

const Users: CollectionConfig = {
  slug: "users",
  // adds email and password fields by default
  auth: {
    useAPIKey: true,
    forgotPassword: {
      generateEmailHTML: ({ token, user }) => {
        return `<div>
          <h1>Seems like you've lost your password for ${JSON.stringify(user.company.name)}</h1>
          <p>Click the link below to reset your password</p>
        <a href=" http://localhost:3000/admin/reset/${token}">Reset Password</a>
        </div>`;
      },
    },
  },
  admin: {
    useAsTitle: "email",
  },
  hooks: {
    beforeOperation: [emailPrefix, setCompanyHook],
    afterRead: [
      async ({ req, doc }) => {
        try {
          if (doc.company && req.user && req.user.role != "super_admin") {
            console.log("formatting email");
            console.log("docemail: ", doc.email);
            let email = doc.email;
            console.log("email: ", email);
            let parts = email.split("@");
            let localPart = parts[0].split("+")[0];
            let domainPart = parts[1];
            doc.email = localPart + "@" + domainPart;
            console.log("docemail: ", doc.email);
          }
        } catch (e) {
          console.log(e);
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
        return true;
      } else {
        console.log(req.user);
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
