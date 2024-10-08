import type { Access } from "payload/types";
import { checkRole } from "../../hooks/checkRole";

const isSuperAdmin: Access = ({ req }) => {
  if (req.user) {
    try {
      return checkRole(["super_admin"], req.user);
    } catch (_) {
      return false;
    }
  } else {
    return false;
  }
};

export default isSuperAdmin;
