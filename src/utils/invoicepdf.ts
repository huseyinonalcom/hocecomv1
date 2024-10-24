import { Address, Document, DocumentProduct, Establishment, Logo, Payment, User } from "payload/generated-types";
import { dateFormatBe } from "./formatters/dateformatters";
import { addDaysToDate } from "./addtodate";
import { Buffer } from "buffer";

const columns = [70, 120, 170, 220, 270, 320, 370, 420, 470, 520];

function generateTableRow(doc, y, name, description, price, amount, tax, subtotal, isHeader = false) {
  if (isHeader) {
    doc.lineWidth(25);
    // line cap settings
    const bgY = y + 5;
    doc.lineCap("butt").moveTo(30, bgY).lineTo(600, bgY).stroke();
    doc
      .fontSize(10)
      .fillColor("white")
      .text(name, columns[0], y)
      .text(description, columns[1], y)
      .text(price, columns[3], y)
      .text(amount, columns[5], y)
      .text(tax, columns[6], y)
      .text(subtotal, columns[7], y);
  } else {
    doc
      .fontSize(10)
      .fillColor("black")
      .text(name, columns[0], y)
      .text(description, columns[1], y)
      .text(price, columns[3], y)
      .text(amount, columns[5], y)
      .text(tax, columns[6], y)
      .text(subtotal, columns[7], y);
  }
}

function generateInvoiceTable(doc, documentProducts, y) {
  let invoiceTableTop = y;
  generateTableRow(doc, invoiceTableTop, "Name", "Description", "Price", "Amount", "Tax", "Subtotal", true);
  for (let i = 1; i <= documentProducts.length; i++) {
    const item = documentProducts[i - 1];
    const position = invoiceTableTop + i * 20;
    generateTableRow(
      doc,
      position,
      item.name,
      item.description,
      item.value.toFixed(2),
      item.amount,
      Number(item.subTotalTax).toFixed(2),
      Number(item.subTotal).toFixed(2)
    );
  }
  return invoiceTableTop + (documentProducts.length + 1) * 20;
}

const bankDetails = ({ doc, x, y, establishment }) => {
  let strings = [];
  if (establishment.bankAccount1) {
    strings.push(establishment.bankAccount1);
  }
  if (establishment.bankAccount2 != null) {
    strings.push(establishment.bankAccount2);
  }
  if (establishment.bankAccount3 != null) {
    strings.push(establishment.bankAccount3);
  }
  strings.map((string, index) => {
    doc.text(string, x, y + index * 15);
  });
};

const customerDetails = ({ doc, x, y, document }) => {
  let strings = [];
  const customer = document.customer as User;
  const docAddress = document.delAddress as Address;

  if (customer?.customerCompany) {
    strings.push(customer.customerCompany);
  }

  if (customer?.customerTaxNumber) {
    strings.push(customer.customerTaxNumber);
  }

  if (customer?.phone) {
    strings.push(customer.phone);
  }

  strings.push(`${docAddress.street} ${docAddress.door}`);
  if (docAddress.floor) {
    strings.push(`${"floor"}:${docAddress.floor}`);
  }
  strings.push(`${docAddress.zip} ${docAddress.city} ${docAddress.country}`);

  strings.map((string, index) => {
    doc.text(string, x, y + index * 15);
  });
  return y + strings.length * 15;
};

const pageLeft = 20;
const pageTop = 40;

export async function generateInvoice({ document }: { document: Document }): Promise<{ filename: string; content: Buffer; contentType: string }> {

  console.log("document: ", document);

  const establishment = document.establishment as Establishment;
  const establishmentAddress = establishment.address as Address;

  return new Promise(async (resolve, reject) => {
    try {
      const PDFDocument = require("pdfkit");
      const doc = new PDFDocument({ size: "A4", margin: 20 });
      const buffers: Uint8Array[] = [];

      doc.on("data", buffers.push.bind(buffers));

      // Fetch logo image from the URL
      const response = await fetch((establishment.logo as Logo).url);
      const logoBuffer = await Buffer.from(await response.arrayBuffer());

      // Add logo to the document
      doc.image(logoBuffer, pageLeft, pageTop, { height: 50 });

      // Header
      doc.fontSize(20).text("INVOICE", 500, pageTop);

      // Invoice Details
      doc.fontSize(10).text("Invoice:", 400, 80);
      doc.text(`${(document.prefix ?? "") + document.number}`, 480, 80);
      doc.text("Date:", 400, 95);
      doc.text(dateFormatBe(document.date), 480, 95);
      doc.text("Valid Until:", 400, 110);
      doc.text(dateFormatBe(addDaysToDate(document.date, 15).toISOString()), 480, 110);
      doc.text("Delivery Date:", 400, 125);
      if (document.deliveryDate) {
        doc.text(dateFormatBe(document.deliveryDate), 480, 125);
      }

      let y = 140;

      // Establishment Details
      // Column 1
      doc.text(establishment.name, 50, y);
      doc.text(establishment.taxID, 50, y + 15);
      bankDetails({
        doc,
        x: 50,
        y: y + 30,
        establishment,
      });

      // Column 2
      doc.text(establishmentAddress.street + " " + establishmentAddress.door, 200, y);
      doc.text(establishmentAddress.zip + " " + establishmentAddress.city, 200, y + 15);
      doc.text(establishment.phone, 200, 160);
      doc.text(establishment.phone2, 200, 175);

      // Customer Details
      doc.text("Order: " + document.references, 400, y);
      doc.text(`${(document.customer as User).firstName} ${(document.customer as User).lastName}`, 400, y + 15);
      y = customerDetails({
        doc,
        x: 400,
        y: y + 30,
        document,
      });

      doc.text((document.delAddress as Address).street + " " + (document.delAddress as Address).door, 400, y + 15);
      doc.text(
        (document.delAddress as Address).zip + " " + (document.delAddress as Address).city + " " + (document.delAddress as Address).country,
        400,
        y + 30
      );
      if ((document.delAddress as Address).floor) {
        doc.text("Floor: " + (document.delAddress as Address).floor, 400, y + 45);
      }

      y += 60;
      y = generateInvoiceTable(doc, document.documentProducts as DocumentProduct[], y);

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
        resolve({
          filename: `invoice_${document.number}.pdf`,
          content: pdfData,
          contentType: "application/pdf",
        });
      });
    } catch (error) {
      console.error("error on pdf generation (invoice): ", error);
      reject(`Error generating invoice: ${error.message}`);
    }
  });
}
