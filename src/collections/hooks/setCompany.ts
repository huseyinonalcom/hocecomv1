import { CollectionBeforeChangeHook } from "payload/types";
import isSuperAdmin from "../users/access/superAdminCheck";

export const setCompanyHook: CollectionBeforeChangeHook = async ({ data, req }) => {
  try {
    console.log(data);
    if (req.user) {
      if (!isSuperAdmin({ req })) {
        data.company = req.user.company.id;
      }
    }
  } catch (e) {
    console.log(e);
  }
  return data;
};
