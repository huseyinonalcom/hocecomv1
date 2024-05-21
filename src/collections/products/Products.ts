import { CollectionConfig } from "payload/types";

const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "name",
  },
  fields: [
    { name: "name", type: "text" },
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies" },
    { name: "extraFields", type: "json" },
    { name: "productImages", type: "relationship", hasMany: true, relationTo: "productImages" },
  ],
};

export default Products;
