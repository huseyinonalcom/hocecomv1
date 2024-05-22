import { CollectionBeforeOperationHook } from "payload/types";
import isSuperAdmin from "../access/superAdminCheck";
export const emailPrefix: CollectionBeforeOperationHook = async ({ args, operation, req }) => {
  try {
    if (operation == "login" || operation == "forgotPassword") {
      if (!req.query.company) {
      } else {
        req.body.email = `${req.body.email.split("@")[0]}+${req.query.company}@${req.body.email.split("@")[1]}`;
      }
    } else if (isSuperAdmin({ req })) {
    } else if (operation == "create" || operation == "update" || operation == "refresh" || operation == "autosave") {
      if (!req.query.setCompany) {
      } else {
        req.body.email = `${req.body.email.split("@")[0]}+${req.query.company}@${req.body.email.split("@")[1]}`;
      }
    }
  } catch (e) {
    console.log(e);
  }

  return args;
};
