import path from "path";

import { payloadCloud } from "@payloadcms/plugin-cloud";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { webpackBundler } from "@payloadcms/bundler-webpack";
import { slateEditor } from "@payloadcms/richtext-slate";
import { buildConfig } from "payload/config";

import Users from "./collections/users/Users";
import Companies from "./collections/companies/Companies";
import Logos from "./collections/logos/Logos";
import Establishments from "./collections/establishments/Establishments";
import Products from "./collections/products/Products";
import ProductImages from "./collections/productImages/ProductImages";
import Addresses from "./collections/addresses/Addresses";
import Shelves from "./collections/shelves/Shelves";
import ProductCategories from "./collections/productCategories/Categories";
import Documents from "./collections/documents/Documents";

export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
  },
  editor: slateEditor({}),
  collections: [Users, Companies, Establishments, Logos, Products, ProductImages, Addresses, Shelves, ProductCategories, Documents],
  typescript: {
    outputFile: path.resolve(__dirname, "payload-types.ts"),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, "generated-schema.graphql"),
  },
  plugins: [payloadCloud()],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),
});
