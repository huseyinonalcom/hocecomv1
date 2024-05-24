import { CollectionConfig } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";

const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "name",
  },
  access: {
    create: ({ req }) => {
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
    { name: "name", type: "text", required: true },
    { name: "description", type: "textarea" },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    { name: "EAN", type: "text" },
    { name: "internalCode", type: "text" },
    { name: "value", type: "number", required: true },
    { name: "category", type: "relationship", relationTo: "product-categories", hasMany: true, required: true },
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies", required: true },
    { name: "extraFields", type: "json" },
    { name: "productImages", type: "relationship", hasMany: true, relationTo: "product-images" },
    { name: "shelves", type: "relationship", hasMany: true, relationTo: "shelves" },
  ],
};

export default Products;
