import { GlobalConfig } from "payload/types";
import isSuperAdmin from "./users/access/superAdminCheck";

const FlutterVersion: GlobalConfig = {
  slug: "flutterversion",
  access: {
    read: () => true,
    update: isSuperAdmin,
  },
  fields: [
    {
      name: "version",
      type: "number",
      required: false,
      defaultValue: 1,
    },
    {
      name: "urlW",
      type: "text",
      required: false,
    },
    {
      name: "urlM",
      type: "text",
      required: false,
    },
  ],
};

export default FlutterVersion;
