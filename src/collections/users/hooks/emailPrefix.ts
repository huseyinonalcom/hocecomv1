import { CollectionBeforeOperationHook } from "payload/types";
import isSuperAdmin from "../access/superAdminCheck";

export const emailPrefix: CollectionBeforeOperationHook = async ({ args, operation, req }) => {
  if (operation == "login" || operation == "forgotPassword") {
    if (!req.query.company) {
    } else {
      req.body.email = `${req.query.company}+${req.body.email}`;
    }
  } else if (isSuperAdmin({ req })) {
    console.log("Super Admin creating user");
  } else {
    if (!req.params.company && !req.user) {
    } else {
      if (operation == "create" || operation == "update" || operation == "refresh" || operation == "autosave") {
        req.body.email = `${req.user.company}+${req.body.email}`;
      }
    }
  }

  return args;
};
