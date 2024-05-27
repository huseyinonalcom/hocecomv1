import { Access } from "payload/config";
import { checkRole } from "../../hooks/checkRole";

/**
 * Check if the current user is a web frontend for the company
 * @param req
 * @returns boolean
 */

export const websiteCheckForCompany: Access = ({ req }) => {
  if (checkRole(["website"], req.user)) {
    return {
      id: {
        equals: req.user.company?.id ?? req.user.company,
      },
    };
  } else {
    return false;
  }
};
