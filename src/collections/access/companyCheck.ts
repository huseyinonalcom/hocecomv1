import { Access } from "payload/config";
import { checkRole } from "../hooks/checkRole";

/**
 * Check if the current user is an admin or employee of the company
 * @param req
 * @returns boolean
 */

export const companyCheck: Access = ({ req }) => {
  if (checkRole(["employee"], req.user)) {
    return {
      company: {
        equals: req.user.company,
      },
    };
  } else {
    return false;
  }
};
