import { CollectionBeforeReadHook } from "payload/types";
import { checkRole } from "./checkRole";

export const hideDeletedHook: CollectionBeforeReadHook = async ({ query, req }) => {
  console.log("hideDeletedHook");
  console.log(req.user);
  console.log(req.query);
  if (checkRole(["website", "customer"], req.user)) {
    //   args.where = {
    //     ...args.where,
    //     isDeleted: { equals: false },
    //   };
  }
  // return args;
};
