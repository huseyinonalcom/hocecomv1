import { CollectionBeforeOperationHook } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";

export const setCompanyHook: CollectionBeforeOperationHook = async ({ args, operation, req }) => {
  try {
    if (req.user) {
      if (!isSuperAdmin({ req })) {
        if (operation == "create" || operation == "update") {
          req.body.company = req.user.company.id;
        }
      }
    }
  } catch (e) {
    console.log(e);
  }

  return args;
};
