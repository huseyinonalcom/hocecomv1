import payload from "payload";
import { generateInvoice } from "../utils/invoicepdf";
import { sendMail } from "../utils/sendmail";
import { CollectionAfterChangeHook } from "payload/types";

const sendDocumentMail: CollectionAfterChangeHook = async ({ operation, doc }) => {
  try {
    doc = await payload.findByID({
      collection: "documents",
      id: doc.id,
      depth: 3,
      overrideAccess: true,
    });
    let pdf = null;
    try {
      pdf = await generateInvoice({
        document: doc,
      });
    } catch (error) {
      console.error("error on pdf generation: ", error);
      pdf = null;
      throw new Error(error);
    }
    await sendMail({
      recipient: "huseyin-_-onal@hotmail.com",
      subject: `Bestelling ${doc.prefix ?? ""}${doc.number}`,
      company: doc.company,
      attachments: [
        {
          filename: pdf.filename,
          content: pdf.content,
          contentType: pdf.contentType,
        },
      ],
      html: `<p>Beste ${
        doc.customer.firstName + " " + doc.customer.lastName
      },</p><p>In bijlage vindt u het factuur voor uw laatste bestelling bij ons.</p><p>Met vriendelijke groeten.</p><p>${doc.company.name}</p>`,
    });
  } catch (error) {
    console.error(error);
  }
};

export default sendDocumentMail;
