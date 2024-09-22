import { CollectionBeforeReadHook } from "payload/types";
import { checkRole } from "./checkRole";

export const hideDeletedHook: CollectionBeforeReadHook = async ({ query, req }) => {
  if (checkRole(["website", "customer"], req.user)) {
    console.log(req.query);
    //   args.where = {
    //     ...args.where,
    //     isDeleted: { equals: false },
    //   };
  }
  // return args;
};
