import { CollectionConfig } from "payload/types";

const Companies: CollectionConfig = {
  slug: "companies",
  admin: {
    useAsTitle: "name",
  },
  fields: [
    { name: "name", type: "text" },
    { name: "logo", type: "relationship", hasMany: false, relationTo: "logos" },
  ],
};

export default Companies;
