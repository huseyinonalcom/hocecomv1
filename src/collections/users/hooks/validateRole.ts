import { CollectionBeforeChangeHook } from "payload/types";
import APIError from "payload/dist/errors/APIError";

export const validateRole: CollectionBeforeChangeHook = async ({ req }) => {
  try {
    switch (req.user.role) {
      case "super_admin":
        break;
      case "website":
        if (req.body.role != "customer") {
          throw new APIError("You do not have permission to create a user with this role.", 403);
        }
        break;
      case "employee":
        if (req.body.role != "customer") {
          throw new APIError("You do not have permission to create a user with this role.", 403);
        }
        break;
      case "admin":
        if (req.body.role != "customer" && req.body.role != "employee") {
          throw new APIError("You do not have permission to create a user with this role.", 403);
        }
        break;
      default:
        throw new APIError("No user detected.", 403);
    }
  } catch (e) {
    console.log(e);
    throw new APIError("You do not have permission to create a user with this role.", 403);
  }
};
