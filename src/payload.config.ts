import path from "path";

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
import Payments from "./collections/payments/Payments";
import DocumentProducts from "./collections/documentProducts/DocumentsProducts";

export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
  },
  email: {
    fromName: "Admin",
    fromAddress: process.env.SMTP_USER,
    transportOptions: {
      host: process.env.SMTP_HOST,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      port: process.env.SMTP_PORT,
      secure: false,
    },
  },
  editor: slateEditor({}),
  collections: [Users, Companies, Establishments, Logos, Products, ProductImages, Addresses, Shelves, ProductCategories, Documents, Payments, DocumentProducts],
  typescript: {
    outputFile: path.resolve(__dirname, "payload-types.ts"),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, "generated-schema.graphql"),
  },
  plugins: [],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),
});
