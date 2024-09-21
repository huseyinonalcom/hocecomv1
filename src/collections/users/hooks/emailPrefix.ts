import { CollectionBeforeOperationHook } from "payload/types";
import isSuperAdmin from "../access/superAdminCheck";
import APIError from "payload/dist/errors/APIError";

export const emailPrefix: CollectionBeforeOperationHook = async ({ args, operation, req }) => {
  try {
    if (isSuperAdmin({ req })) {
      return args;
    } else if (operation == "login" || operation == "forgotPassword") {
      if (req.query.company) {
        // company query param denotes which company the acoount belongs to
        // we add this to the email as a tag so we can differentiate between accounts with the same email
        req.body.email = `${req.body.email.split("@")[0]}+${req.query.company}@${req.body.email.split("@")[1]}`;
      }
      // no company query means the user might be trying to login from the admin panel
      // probably won't succeed, but even if they succeed, they won't be able to do anything
      // they can't do with the API anyways
      // if it isn't the case, not having a company query param will fail validation
    }
  } catch (e) {
    try {
      // graphql version
      if (req.query.company) {
        req.body.variables.email = `${req.body.variables.email.split("@")[0]}+${req.query.company}@${req.body.variables.email.split("@")[1]}`;
      }
    } catch (e) {
      console.log(e);
      console.log(req.body);
      throw new APIError("No company could be determined for this user.", 403);
    }
  }

  return args;
};
