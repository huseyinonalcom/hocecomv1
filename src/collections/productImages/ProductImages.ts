import { CollectionConfig } from "payload/types";
import { setCompanyHook } from "../hooks/setCompany";

const ProductImages: CollectionConfig = {
  slug: "productImages",
  upload: {
    staticURL: "product-images",
    staticDir: "product-images",
    mimeTypes: ["image/*"],
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
