import { CollectionConfig } from "payload/types";

const Establishments: CollectionConfig = {
  slug: "establishments",
  admin: {
    useAsTitle: "name",
  },
  fields: [
    { name: "name", type: "text" },
    { name: "logo", type: "relationship", hasMany: false, relationTo: "logos" },
    { name: "company", type: "relationship", hasMany: false, relationTo: "companies" },
    { name: "users", type: "relationship", hasMany: true, relationTo: "users" },
  ],
};

export default Establishments;
