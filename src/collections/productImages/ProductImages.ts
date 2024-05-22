import { CollectionConfig } from "payload/types";
import { setCompanyHook } from "../hooks/setCompany";
import isSuperAdmin from "../users/access/superAdminCheck";

const ProductImages: CollectionConfig = {
  slug: "productImages",
  upload: {
    staticURL: "product-images",
    staticDir: "product-images",
    mimeTypes: ["image/*"],
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
  hooks: {
    beforeOperation: [setCompanyHook],
  },
  admin: {
    useAsTitle: "name",
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "product", type: "relationship", hasMany: false, relationTo: "products", required: true },
    { name: "priority", type: "number", defaultValue: 0 },
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies", required: true },
  ],
};

export default ProductImages;
