import { CollectionConfig } from "payload/types";

const ProductImages: CollectionConfig = {
  slug: "productImages",
  upload: {
    staticURL: "product-images",
    staticDir: "product-images",
    mimeTypes: ["image/*"],
  },
  admin: {
    useAsTitle: "name",
  },
  fields: [
    { name: "name", type: "text" },
    { name: "product", type: "relationship", hasMany: false, relationTo: "products" },
  ],
};

export default ProductImages;
