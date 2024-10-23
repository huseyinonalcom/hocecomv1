import payload from "payload";
import { generateInvoice } from "../utils/invoicepdf";
import { sendMail } from "../utils/sendmail";

const sendDocumentMail = async ({ operation, doc }) => {
  try {
    console.log(doc);
    doc.establishment = await payload.findByID({
      collection: "establishments",
      id: doc.establishment,
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
    // doc doesn't have the populated data yet
    // so we need to populate it
    await sendMail({
      recipient: "huseyin-_-onal@hotmail.com",
      subject: `Bestelling ${doc.prefix ?? ""}${doc.number}`,
      company: doc.company,
      attachments: [pdf],
      html: `<p>Beste ${
        doc.customer.firstName + " " + doc.customer.lastName
      },</p><p>In bijlage vindt u het factuur voor uw laatste bestelling bij ons.</p><p>Met vriendelijke groeten.</p><p>${doc.company.name}</p>`,
    });
  } catch (error) {
    console.error(error);
  }
};

export default sendDocumentMail;
