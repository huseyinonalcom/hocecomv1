import { CollectionBeforeOperationHook } from "payload/types";

export const setCompanyHook: CollectionBeforeOperationHook = async ({ args, operation, req }) => {
  if (req.user) {
    if (req.user.role != "super_admin") {
      if (operation == "create" || operation == "update") {
        req.body.company = req.user.company.id;
      }
    }
  }

  return args;
};
