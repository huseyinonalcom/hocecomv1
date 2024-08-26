import { generateInvoice } from "../utils/invoicepdf";
import { sendMail } from "../utils/sendmail";

const sendDocumentMail = async ({ operation, doc }) => {
  try {
    // doc doesn't have the populated data yet
    // so we need to populate it
    await sendMail({
      recipient: "huseyin-_-onal@hotmail.com",
      subject: `Bestelling ${doc.prefix ?? ""}${doc.number}`,
      company: doc.company,
      attachments: [
        await generateInvoice({
          document: doc,
          establishment: doc.establishment,
        }),
      ],
      html: `<p>Beste ${
        doc.customer.firstName + " " + doc.customer.lastName
      },</p><p>In bijlage vindt u het factuur voor uw laatste bestelling bij ons.</p><p>Met vriendelijke groeten.</p><p>${doc.company.name}</p>`,
    });
  } catch (error) {
    console.log(error);
  }
};

export default sendDocumentMail;