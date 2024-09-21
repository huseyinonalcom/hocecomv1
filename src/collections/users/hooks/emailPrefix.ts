import { CollectionBeforeOperationHook } from "payload/types";
import isSuperAdmin from "../access/superAdminCheck";
import APIError from "payload/dist/errors/APIError";

export const emailPrefix: CollectionBeforeOperationHook = async ({ args, operation, req }) => {
  try {
    if (isSuperAdmin({ req })) {
      return args;
    } else if (operation == "login" || operation == "forgotPassword") {
      if (req.query.company) {
        const company = req.query.company;
        // company query param denotes which company the acoount belongs to
        // we add this to the email as a tag so we can differentiate between accounts for different companies (tenants) with the same email
        req.body.email = `${req.body.email.split("@")[0]}+${req.query.company}@${req.body.email.split("@")[1]}`;

        if (req.body?.email) {
          console.log('rest api request');
          req.body.email = `${req.body.email.split("@")[0]}+${company}@${req.body.email.split("@")[1]}`;
        } else if (req.body?.variables?.email) {
          // Handling GraphQL requests (email in req.body.variables)
          console.log('graphql request');
          req.body.variables.email = `${req.body.variables.email.split("@")[0]}+${company}@${req.body.variables.email.split("@")[1]}`;
        }
      }
      // no company query means the user might be trying to login from the admin panel
      // probably won't succeed, but even if they succeed, they won't be able to do anything
      // they can't do with the API anyways
      // if it isn't the case, not having a company query param will fail validation
    }
  } catch (e) {
    console.log(req.body);
    console.log(e);
    throw new APIError("No company could be determined for this user.", 403);
  }

  return args;
};
