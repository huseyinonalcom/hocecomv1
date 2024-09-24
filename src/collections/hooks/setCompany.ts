import { CollectionBeforeChangeHook } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";

export const setCompanyHook: CollectionBeforeChangeHook = async ({ data, req }) => {
  try {
    if (req.user) {
      if (!isSuperAdmin({ req })) {
        data.company = req.user.company?.id ?? req.user.company;
      }
    }
  } catch (e) {}
  return data;
};
