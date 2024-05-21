import type { Access } from "payload/types";
import { checkRole } from "../checkRole";

const isSuperAdmin: Access = ({ req: { user } }) => {
  if (user) {
    try {
      return checkRole(["super_admin"], user);
    } catch (_) {
      return false;
    }
  } else {
    return false;
  }
};

export default isSuperAdmin;
