import { CollectionConfig } from "payload/types";

const ProductCategories: CollectionConfig = {
  slug: "productCategories",
  admin: {
    useAsTitle: "name",
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "description", type: "textarea" },
    { name: "headCategory", type: "relationship", relationTo: "productCategories", hasMany: false },
    { name: "subCategories", type: "relationship", relationTo: "productCategories", hasMany: true },
    { name: "categoryImage", type: "relationship", relationTo: "productImages", hasMany: false },
    { name: "products", type: "relationship", relationTo: "products", hasMany: true },
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies", required: true },
  ],
};

export default ProductCategories;
