import type { Access } from "payload/types";
import { checkRole } from "../checkRole";

const adminsAndCreator: Access = ({ req: { user } }) => {
  if (user) {
    if (checkRole(["admin"], user)) {
      return true;
    }

    return {
      id: {
        equals: user.id,
      },
    };
  }

  return false;
};

export default adminsAndCreator;
