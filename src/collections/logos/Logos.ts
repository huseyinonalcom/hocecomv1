import { CollectionConfig } from "payload/types";

const Logos: CollectionConfig = {
  slug: "logos",
  upload: {
    staticURL: "/logos",
    staticDir: "logos",
    mimeTypes: ["image/*"],
  },
  admin: {
    useAsTitle: "name",
  },
  fields: [
    { name: "name", type: "text" },
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies" },
    { name: "establishment", type: "relationship", hasMany: false, relationTo: "establishments" },
  ],
};

export default Logos;
