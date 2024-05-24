import { CollectionBeforeOperationHook } from "payload/types";
import { checkRole } from "./checkRole";

export const hideDeletedHook: CollectionBeforeOperationHook = async ({ args, req }) => {
  if (checkRole(["website", "customer"], req.user)) {
    args.where = {
      ...args.where,
      isDeleted: { equals: false },
    };
  }
  return args;
};
