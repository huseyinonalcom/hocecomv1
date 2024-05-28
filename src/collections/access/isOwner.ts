import { Access } from "payload/config";
import { checkRole } from "../hooks/checkRole";

/**
 * Check if the current user is the owner of the object
 * 
 * Only for employee and customer checking
 * @param req
 * @returns boolean
 */

export const ownerCheck: Access = ({ req }) => {
  if (checkRole(["employee", "customer"], req.user)) {
    return {
      company: {
        equals: req.user.company.id ?? req.user.company,
      },
    };
  } else {
    return false;
  }
};
