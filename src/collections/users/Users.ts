import { CollectionBeforeChangeHook, CollectionConfig } from "payload/types";
import isSuperAdmin from "./access/superAdminCheck";
import { emailPrefix } from "./hooks/emailPrefix";
import { setCompanyHook } from "../hooks/setCompany";
import { validateRole } from "./hooks/validateRole";
import { checkRole } from "../hooks/checkRole";

const tagMail: CollectionBeforeChangeHook = async ({ req, data }) => {
  if (data.email) {
    let email = data.email;
    let parts = email.split("@");
    let localPart = parts[0].split("+")[0];
    let domainPart = parts[1];
    data.email = localPart + "+" + req.user.company.id + "@" + domainPart;
    data.company = req.user.company.id;
  }
  return data;
};

const Users: CollectionConfig = {
  slug: "users",
  // auth adds email and password fields by default
  auth: {
    tokenExpiration: 302400,
    useAPIKey: true,
    forgotPassword: {
      generateEmailHTML: ({
        token,
        user,
      }: {
        token: string;
        user: { company: { name } };
      }) => {
        return `<div>
          <h1>Seems like you've lost your password for ${JSON.stringify(
            user.company.name
          )}</h1>
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
    beforeOperation: [setCompanyHook, emailPrefix],
    beforeChange: [tagMail, validateRole],
    afterRead: [
      // fieldSelectionHook,
      async ({ req, doc }) => {
        try {
          if (doc.company && req.user && req.user.role != "super_admin") {
            let email = doc.email;
            let parts = email.split("@");
            let localPart = parts[0].split("+")[0];
            let domainPart = parts[1];
            doc.email = localPart + "@" + domainPart;
          }
        } catch (e) {
          console.log(e);
        }
      },
    ],
  },
  access: {
    create: () => true,
    read: ({ req }) => {
      if (isSuperAdmin({ req })) {
        return true;
      } else if (checkRole(["customer"], req.user)) {
        return {
          email: {
            equals: req.user.email,
          },
        };
      } else if (checkRole(["website"], req.user)) {
        return {
          email: {
            equals: req.user.email,
          },
        };
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
      } else if (checkRole(["admin"], req.user)) {
        return {
          company: {
            equals: req.user.company.id,
          },
        };
      } else {
        return {
          email: {
            equals: req.user.email,
          },
        };
      }
    },
    delete: ({ req }) => isSuperAdmin({ req }),
  },
  fields: [
    // email and password exist by default
    // common fields
    {
      name: "role",
      type: "select",
      saveToJWT: true,
      defaultValue: "customer",
      options: [
        {
          label: "Super Admin",
          value: "super_admin",
        },
        { label: "Website", value: "website" },
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
      access: {
        update: ({ req }) => {
          if (
            isSuperAdmin({ req }) ||
            checkRole(["admin", "super_admin"], req.user)
          ) {
            return true;
          } else {
            return false;
          }
        },
      },
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
      access: {
        update: ({ req }) => {
          if (
            isSuperAdmin({ req }) ||
            checkRole(["admin", "super_admin"], req.user)
          ) {
            return true;
          } else {
            return false;
          }
        },
      },
    },
    {
      name: "company",
      type: "relationship",
      hasMany: false,
      saveToJWT: true,
      relationTo: "companies",
      access: {
        update: ({ req }) => {
          if (isSuperAdmin({ req })) {
            return true;
          } else {
            return false;
          }
        },
      },
    },
    {
      name: "establishment",
      type: "relationship",
      saveToJWT: true,
      relationTo: "establishments",
    },
    {
      name: "payments",
      type: "relationship",
      hasMany: true,
      relationTo: "payments",
    },
    { name: "preferredLanguage", type: "text" },
    // employee fields
    {
      name: "employeeRank",
      saveToJWT: true,
      type: "select",
      options: [
        {
          label: "0",
          value: "0",
        },
        {
          label: "1",
          value: "1",
        },
        {
          label: "2",
          value: "2",
        },
        {
          label: "3",
          value: "3",
        },
        {
          label: "4",
          value: "4",
        },
        {
          label: "5",
          value: "5",
        },
        {
          label: "6",
          value: "6",
        },
        {
          label: "7",
          value: "7",
        },
        {
          label: "8",
          value: "8",
        },
        {
          label: "9",
          value: "9",
        },
      ],
    },
    // customer fields
    {
      name: "customerCategory",
      saveToJWT: true,
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
      name: "receivedDeliveries",
      type: "relationship",
      hasMany: true,
      relationTo: "deliveries",
    },
    {
      name: "receivedTasks",
      type: "relationship",
      hasMany: true,
      relationTo: "tasks",
    },
    {
      name: "issuedTasks",
      type: "relationship",
      hasMany: true,
      relationTo: "tasks",
    },
    {
      name: "documents",
      type: "relationship",
      hasMany: true,
      relationTo: "documents",
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
