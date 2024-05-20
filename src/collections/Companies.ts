import { CollectionConfig } from "payload/types";

const Companies: CollectionConfig = {
  slug: "companies",
  admin: {
    useAsTitle: "name",
  },
  fields: [
    { name: "name", type: "text" },
    { name: "logo", type: "relationship", hasMany: false, relationTo: "logos" },
    { name: "establishment", type: "relationship", hasMany: true, relationTo: "establishments" },
  ],
};

export default Companies;
