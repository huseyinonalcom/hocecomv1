import { CollectionConfig } from "payload/types";

const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "name",
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "description", type: "textarea" },
    { name: "value", type: "number", required: true },
    { name: "category", type: "relationship", relationTo: "productCategories", hasMany: true, required: true },
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies", required: true },
    { name: "extraFields", type: "json" },
    { name: "productImages", type: "relationship", hasMany: true, relationTo: "productImages" },
    { name: "shelves", type: "relationship", hasMany: true, relationTo: "shelves" },
  ],
};

export default Products;
