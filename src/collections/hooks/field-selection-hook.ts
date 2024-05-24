import { CollectionAfterReadHook } from "payload/types";

export const fieldSelectionHook: CollectionAfterReadHook = async ({ req, doc }) => {
  try {
    if (doc) {
      if (req.query.fields) {
        const requestedFields: string[] = req.query.fields as string[];
        const fields = Object.keys(doc);
        for (let i = 0; i < fields.length; i++) {
          if (fields[i] == "id") {
          } else if (!requestedFields.includes(fields[i])) {
            delete doc[fields[i]];
          }
        }
      }
    }
  } catch (e) {}

  return doc;
};
