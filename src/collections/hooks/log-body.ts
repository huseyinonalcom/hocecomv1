import { CollectionBeforeChangeHook } from "payload/types";

export const logBody: CollectionBeforeChangeHook = async ({
  req,
}) => {
  console.log(req.body);
};
