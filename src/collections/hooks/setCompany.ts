import { CollectionBeforeChangeHook } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";

export const setCompanyHook: CollectionBeforeChangeHook = async ({
  operation,
  req,
}) => {
  try {
    if (operation == "create" || operation == "update") {
      if (req.user) {
        if (!isSuperAdmin({ req })) {
          req.body.company = req.user.company.id;
        }
      }
    } else {
      console.log(req.user);
    }
  } catch (e) {
    console.log(e);
  }
};
