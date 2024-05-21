import { CollectionConfig } from "payload/types";

const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "name",
  },
  fields: [
    { name: "name", type: "text" },
    { name: "description", type: "textarea" },
    { name: "price", type: "number" },
    { name: "category", type: "relationship", relationTo: "productCategories", hasMany: true },
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies" },
    { name: "extraFields", type: "json" },
    { name: "productImages", type: "relationship", hasMany: true, relationTo: "productImages" },
    { name: "shelves", type: "relationship", hasMany: true, relationTo: "shelves" },
  ],
};

export default Products;
