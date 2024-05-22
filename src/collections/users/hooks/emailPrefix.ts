import { CollectionBeforeOperationHook } from "payload/types";
import isSuperAdmin from "../access/superAdminCheck";

export const emailPrefix: CollectionBeforeOperationHook = async ({ args, operation, req }) => {
  if (operation == "login" || operation == "forgotPassword") {
    if (!req.query.company) {
    } else {
      req.body.email = `${req.body.email.split("@")[0]}+${req.query.company}${req.body.email.split("@")[1]}`;
    }
  } else if (isSuperAdmin({ req })) {
  } else {
    if (!req.query.company && !req.user) {
    } else {
      if (operation == "create" || operation == "update" || operation == "refresh" || operation == "autosave") {
        req.body.email = `${req.body.email.split("@")[0]}+${req.query.company}${req.body.email.split("@")[1]}`;
      }
    }
  }

  return args;
};
