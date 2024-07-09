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
import { cloudStorage } from "@payloadcms/plugin-cloud-storage";
import { s3Adapter } from "@payloadcms/plugin-cloud-storage/s3";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";
import Deliveries from "./collections/deliveries/Deliveries";
import Tasks from "./collections/tasks/Tasks";
import SupportTicketMessages from "./collections/supportTicketsMessages/SupportTicketMessages";
import SupportTickets from "./collections/supportTickets/SupportTickets";
import ProductCollections from "./collections/productCollections/Collections";
import ProductPromos from "./collections/productPromos/Promos";
import Suppliers from "./collections/suppliers/Suppliers";
import SupplierOrders from "./collections/supplierOrders/SupplierOrders";
import SupplierOrderProducts from "./collections/supplierOrderProducts/SupplierOrderProducts";
import Files from "./collections/files/Files";
import Projects from "./collections/projects/Projects";
import TaskComments from "./collections/taskComments/TaskComments";
import FlutterVersion from "./collections/Flutterversion";
import DriveFiles from "./collections/drive/DriveFile";
import DriveFolders from "./collections/drive/DriveFolder";

const s3ad = s3Adapter({
  config: {
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    region: process.env.S3_REGION,
  },
  bucket: process.env.S3_BUCKET,
});

export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
    webpack: (config) => ({
      ...config,
      plugins: [...config.plugins, new NodePolyfillPlugin()],
    }),
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
  rateLimit: {
    trustProxy: true,
    max: 5000,
  },
  collections: [
    Addresses,
    Companies,
    Deliveries,
    DocumentProducts,
    Documents,
    Establishments,
    Logos,
    Payments,
    ProductCategories,
    ProductCollections,
    ProductImages,
    ProductPromos,
    Projects,
    Products,
    Shelves,
    SupplierOrders,
    SupplierOrderProducts,
    Suppliers,
    SupportTicketMessages,
    SupportTickets,
    Tasks,
    Users,
    TaskComments,
    Files,
    DriveFiles,
    DriveFolders,
  ],
  globals: [FlutterVersion],
  typescript: {
    outputFile: path.resolve(__dirname, "payload-types.ts"),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, "generated-schema.graphql"),
    disable: true,
  },
  csrf: [
    "http://localhost:5173",
    "http://localhost:3421",
    "https://api.hocecomv1.com",
    "https://istanbulfood.hocecomv1.com",
    "https://hocecomv1.com",
    "https://barbardotantwerpen.com",
    "https://menu.barbardotantwerpen.com",
    "http://192.168.129.51:5173",
  ],
  cors: [
    "http://localhost:5173",
    "http://localhost:3421",
    "https://api.hocecomv1.com",
    "https://istanbulfood.hocecomv1.com",
    "https://hocecomv1.com",
    "https://barbardotantwerpen.com",
    "https://menu.barbardotantwerpen.com",
    "http://192.168.129.51:5173",
  ],
  plugins: [
    cloudStorage({
      collections: {
        logos: {
          adapter: s3ad,
        },
        "product-images": {
          adapter: s3ad,
        },
        files: {
          adapter: s3ad,
        },
        "drive-files": {
          adapter: s3ad,
        },
      },
    }),
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),
});
