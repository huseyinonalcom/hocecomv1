import { CollectionBeforeOperationHook } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";

export const setCompanyHook: CollectionBeforeOperationHook = async ({
  operation,
  req,
}) => {
  try {
    if (operation == "create" || operation == "update") {
      if (req.user) {
        if (!isSuperAdmin({ req })) {
          req.body = { ...req.body, company: req.user.company.id };
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};
