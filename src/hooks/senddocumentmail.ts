import payload from "payload";
import { generateInvoice } from "../utils/invoicepdf";
import { sendMail } from "../utils/sendmail";
import { CollectionAfterChangeHook } from "payload/types";

const sendDocumentMail: CollectionAfterChangeHook = async ({ operation, doc }) => {
  try {
    console.log("sendDocumentMail hook");
    doc.establishment = await payload.findByID({
      collection: "establishments",
      id: doc.establishment.id,
      depth: 2,
    });
    let pdf = null;
    try {
      pdf = await generateInvoice({
        document: doc,
      });
    } catch (error) {
      console.error(error);
      pdf = null;
      throw new Error(error);
    }
    console.log("pdf:\n", pdf);
    // doc doesn't have the populated data yet
    // so we need to populate it
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
