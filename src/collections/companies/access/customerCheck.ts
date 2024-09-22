import { Access } from "payload/config";
import { checkRole } from "../../hooks/checkRole";

/**
 * Check if the current user is a customer of the company
 * @param req
 * @returns boolean
 */

export const customerCheckForCompany: Access = ({ req }) => {
  if (checkRole(["customer"], req.user)) {
    console.log("customerCheckForCompany");
    console.log(req.user.company?.id);
    console.log(req.user.company);
    return {
      id: {
        equals: req.user.company?.id ?? req.user.company,
      },
    };
  } else {
    return false;
  }
};
