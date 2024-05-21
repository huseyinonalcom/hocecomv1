/**
 * @deprecated not ready
 */

import type { Access } from "payload/types";
import { checkRole } from "../checkRole";

const companyMember: Access = ({ req: { user } }) => {
  if (user) {
    if (checkRole(["admin", "employee"], user)) {
      return true;
    }

    return {
      company: {},
    };
  } else {
    return false;
  }
};

export default companyMember;
