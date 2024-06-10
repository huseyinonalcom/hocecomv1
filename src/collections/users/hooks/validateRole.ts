import { CollectionBeforeChangeHook } from "payload/types";
import APIError from "payload/dist/errors/APIError";
import payload from "payload";

export const validateRole: CollectionBeforeChangeHook = async ({ operation, req }) => {
  try {
    const users = await payload.find({
      collection: "users",
      overrideAccess: true,
      depth: 0,
      page: 1,
      limit: 1,
    });
    console.log(users);
    console.log(users.docs);
    console.log(users.totalDocs);
    console.log(req.user);
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
