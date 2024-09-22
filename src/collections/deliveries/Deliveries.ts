import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";
import { setCompanyHook } from "../hooks/setCompany";

const Deliveries: CollectionConfig = {
  slug: "deliveries",
  admin: {
    useAsTitle: "category",
  },
  hooks: {
    beforeChange: [setCompanyHook],
  },
  access: {
    create: ({ req }) => {
      if (isSuperAdmin({ req })) {
        return true;
      } else {
        return {
           company: {
            equals: req.user.company?.id ?? req.user.company,
          },
        };
      }
    },
    read: ({ req }) => {
      if (isSuperAdmin({ req })) {
        return true;
      } else {
        return {
           company: {
            equals: req.user.company?.id ?? req.user.company,
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
            equals: req.user.company?.id ?? req.user.company,
          },
        };
      }
    },
    delete: () => {
      return false;
    },
  },
  fields: [
    { name: "date", type: "date", required: true },
    { name: "dateCreated", type: "date", required: true },
    { name: "timeStart", type: "date" },
    { name: "timeEnd", type: "date" },
    { name: "notes", type: "textarea" },
    { name: "deliveryTaker", type: "text" },
    { name: "deliveryTakerPhone", type: "text" },
    { name: "lift", type: "checkbox", defaultValue: false },
    { name: "liftPhone", type: "text" },
    { name: "isCompleted", type: "checkbox", defaultValue: false },
    { name: "isIncoming", type: "checkbox", defaultValue: false },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    // relations
    { name: "files", type: "relationship", relationTo: "files", hasMany: true },
    { name: "establishment", type: "relationship", hasMany: false, relationTo: "establishments", required: true },
    { name: "documentProducts", type: "relationship", hasMany: true, relationTo: "document-products" },
    { name: "address", type: "relationship", hasMany: false, relationTo: "addresses", required: true },
    { name: "supplierOrderProducts", type: "relationship", hasMany: true, relationTo: "supplier-order-products" },
    { name: "customer", type: "relationship", hasMany: false, relationTo: "users" },
    { name: "creator", type: "relationship", hasMany: false, relationTo: "users" },
    { name: "assignee", type: "relationship", hasMany: false, relationTo: "users" },
    // company relationship is always required
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies", required: true },
  ],
};

export default Deliveries;
