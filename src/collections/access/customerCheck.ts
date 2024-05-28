import { Access } from "payload/config";
import { checkRole } from "../hooks/checkRole";

/**
 * Check if the current user is a customer of the company
 * @param req
 * @returns boolean
 */

export const customerCheck: Access = ({ req }) => {
  if (checkRole(["customer"], req.user)) {
    return {
      company: {
        equals: req.user.company.id ?? req.user.company,
      },
    };
  } else {
    return false;
  }
};
