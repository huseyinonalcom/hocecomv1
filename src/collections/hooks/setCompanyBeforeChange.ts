import { CollectionBeforeChangeHook } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";

export const setCompanyBeforeChange: CollectionBeforeChangeHook = async ({
  req,
}) => {
  try {
    if (req.user) {
      if (!isSuperAdmin({ req })) {
        req.body = { ...req.body, company: req.user.company.id };
      }
    }
  } catch (e) {
    // console.log(e);
  }
};
