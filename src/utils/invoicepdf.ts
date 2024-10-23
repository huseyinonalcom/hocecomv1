import { Address, Document, DocumentProduct, Establishment, Logo, Payment, User } from "payload/generated-types";
import { dateFormatBe } from "./formatters/dateformatters";
import { addDaysToDate } from "./addtodate";

export async function generateInvoice({ document }: { document: Document }): Promise<Buffer> {
  const establishment = document.establishment as Establishment;
  const establishmentAddress = establishment.address as Address;
  return new Promise(async (resolve, reject) => {
    try {
      const PDFDocument = require("pdfkit");
      const doc = new PDFDocument();
      const buffers: Uint8Array[] = [];

      doc.on("data", buffers.push.bind(buffers));

      // Fetch logo image from the URL
      const response = await fetch((establishment.logo as Logo).url);
      const logoBuffer = await Buffer.from(await response.arrayBuffer());

      // Add logo to the document
      doc.image(logoBuffer, 50, 45, { width: 100 });

      // Header
      doc.fontSize(20).text("INVOICE", 400, 50);

      // Invoice Details
      doc.fontSize(10).text("Invoice #:", 400, 80);
      doc.text(`${document.prefix + document.number}`, 480, 80);
      doc.text("Date:", 400, 95);
      doc.text(dateFormatBe(document.date), 480, 95);
      doc.text("Valid Until:", 400, 110);
      doc.text(dateFormatBe(addDaysToDate(document.date, 15).toISOString()), 480, 110);

      // Establishment Details
      doc.text(establishment.name, 50, 130);
      doc.text(establishmentAddress.street + " " + establishmentAddress.door, 50, 145);
      doc.text(establishmentAddress.zip + " " + establishmentAddress.city + " " + establishmentAddress.country, 50, 160);

      // Customer Details
      doc.text("Invoicing:", 300, 130);
      doc.text(`${(document.customer as User).firstName} ${(document.customer as User).lastName}`, 300, 145);
      doc.text((document.delAddress as Address).street + " " + (document.delAddress as Address).door, 300, 160);
      doc.text((document.delAddress as Address).zip + " " + (document.delAddress as Address).city + " " + (document.delAddress as Address).country, 300, 175);

      // Table Headers
      doc.fontSize(10).text("Name", 50, 220);
      doc.text("Description", 150, 220);
      doc.text("Price", 300, 220);
      doc.text("Amount", 350, 220);
      doc.text("Tax", 400, 220);
      doc.text("Subtotal", 450, 220);

      let y = 240;
      document.documentProducts.forEach((item: DocumentProduct) => {
        doc.text(item.name, 50, y);
        doc.text(item.description, 150, y);
        doc.text(item.value.toFixed(2), 300, y, { width: 40, align: "right" });
        doc.text(item.amount, 350, y, { width: 40, align: "right" });
        doc.text(Number(item.subTotalTax).toFixed(2), 400, y, {
          width: 40,
          align: "right",
        });
        doc.text(Number(item.subTotal).toFixed(2), 450, y, {
          width: 40,
          align: "right",
        });
        y += 20;
      });

      // Payment History
      doc.text("Payment History:", 50, y + 20);

      y += 40;
      document.payments.forEach((payment: Payment) => {
        doc.text(payment.date, 50, y);
        doc.text(payment.type, 150, y);
        doc.text(payment.value.toFixed(2), 450, y, {
          width: 40,
          align: "right",
        });
        y += 20;
      });

      // Totals
      doc.fontSize(10).text("Total Tax:", 400, y + 20);
      doc.text(
        document.documentProducts.reduce((acc: number, dp: DocumentProduct) => acc + Number(dp.subTotalTax), 0),
        480,
        y + 20
      );
      doc.fontSize(10).text("Total Tax (6%):", 400, y + 35);
      doc.text(
        (document.documentProducts as DocumentProduct[])
          .filter((dp) => dp.tax === 6)
          .reduce((acc: number, dp: DocumentProduct) => acc + Number(dp.subTotalTax), 0),
        480,
        y + 35
      );
      doc.fontSize(10).text("Total Tax (12%):", 400, y + 50);
      doc.text(
        (document.documentProducts as DocumentProduct[])
          .filter((dp) => dp.tax === 12)
          .reduce((acc: number, dp: DocumentProduct) => acc + Number(dp.subTotalTax), 0),
        480,
        y + 50
      );
      doc.fontSize(10).text("Total Tax (21%):", 400, y + 65);
      doc.text(
        (document.documentProducts as DocumentProduct[])
          .filter((dp) => dp.tax === 21)
          .reduce((acc: number, dp: DocumentProduct) => acc + Number(dp.subTotalTax), 0),
        480,
        y + 65
      );
      doc.text("Total:", 400, y + 80);
      doc.text(
        (document.documentProducts as DocumentProduct[]).reduce((acc: number, dp: DocumentProduct) => acc + Number(dp.subTotal), 0),
        480,
        y + 80
      );
      doc.text("Already Paid:", 400, y + 95);
      doc.text(
        (document.payments as Payment[]).filter((p) => p.isVerified && !p.isDeleted).reduce((acc: number, dp: Payment) => acc + Number(dp.value), 0),
        480,
        y + 95
      );
      doc.text("Amount Due:", 400, y + 110);
      doc.text(
        (document.documentProducts as DocumentProduct[]).reduce((acc: number, dp: DocumentProduct) => acc + dp.subTotal, 0) -
          (document.payments as Payment[]).filter((p) => p.isVerified && !p.isDeleted).reduce((acc: number, dp: Payment) => acc + Number(dp.value), 0),
        480,
        y + 110
      );

      doc.end();
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
    } catch (error) {
      reject(`Error generating invoice: ${error.message}`);
    }
  });
}
