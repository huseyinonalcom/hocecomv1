import { CollectionConfig } from "payload/types";
import { setCompanyHook } from "../hooks/setCompany";
import isSuperAdmin from "../users/access/superAdminCheck";

const ProductCollections: CollectionConfig = {
  slug: "product-collections",
  admin: {
    useAsTitle: "name",
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
        console.log(req);
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
    { name: "name", type: "text", required: true },
    { name: "description", type: "textarea" },
    { name: "collectionImage", type: "relationship", relationTo: "product-images", hasMany: false },
    { name: "products", type: "relationship", relationTo: "products", hasMany: true },
    { name: "isDeleted", type: "checkbox", defaultValue: false },
    { name: "isFeatured", type: "checkbox", defaultValue: false },
    { name: "tags", type: "textarea" },
    // company relation is awlways required
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies" },
  ],
};

export default ProductCollections;
