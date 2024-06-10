import type { Access } from "payload/types";
import { checkRole } from "../../hooks/checkRole";

const isSuperAdmin: Access = ({ req: { user } }) => {
  console.log(user);
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
