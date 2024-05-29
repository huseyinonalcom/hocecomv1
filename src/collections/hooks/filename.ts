import { CollectionBeforeOperationHook } from "payload/types";

export const makeFileNameUniqueHook: CollectionBeforeOperationHook = async ({ args }) => {
  const files = args.req?.files;
  if (files && files.file && files.file.name) {
    files.file.name = Date.now() + encodeURIComponent(files.file.name);
    args.req.body.name = files.file.name;
  }
};
