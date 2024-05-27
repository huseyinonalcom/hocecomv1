import { Access } from "payload/config";
import isSuperAdmin from "../../users/access/superAdminCheck";
import { checkRole } from "../../hooks/checkRole";

/**
 * Check if the current user is an admin of the company or a super admin
 * @param req
 * @returns boolean
 */

export const adminCheckForCompany: Access = ({ req }) => {
  if (isSuperAdmin({ req })) {
    return true;
  } else if (checkRole(["admin"], req.user)) {
    return {
      id: {
        equals: req.user.company?.id ?? req.user.company,
      },
    };
  } else {
    return false;
  }
};
