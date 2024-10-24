import { Address, Document, DocumentProduct, Establishment, Logo, Payment, User } from "payload/generated-types";
import { dateFormatBe } from "./formatters/dateformatters";
import { addDaysToDate } from "./addtodate";
import { Buffer } from "buffer";
import { formatCurrency } from "./formatters/formatcurrency";

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

export async function generateInvoice({ document }: { document: Document }): Promise<{ filename: string; content: Buffer; contentType: string }> {
  const establishment = document.establishment as Establishment;
  const establishmentAddress = establishment.address as Address;
  const invoiceDoc = document;

  return new Promise(async (resolve, reject) => {
    const pageLeft = 20;
    const pageTop = 40;
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

      // this part is being designed in simulation at the moment
      //
      //
      //
      //

      const columns = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500];

      const generateTableRow = (doc, y, name, description, price, amount, tax, subtotal, isHeader = false) => {
        if (isHeader) {
          doc.lineWidth(25);
          // line cap settings
          const bgY = y + 5;
          doc.lineCap("butt").moveTo(30, bgY).lineTo(600, bgY).stroke("black");
          doc
            .fontSize(10)
            .fillColor("white")
            .text(name, columns[0], y)
            .text(description, columns[4], y)
            .text(price, columns[6], y)
            .text(amount, columns[7], y)
            .text(tax, columns[8], y)
            .text(subtotal, columns[9], y);
        } else {
          doc
            .fontSize(10)
            .fillColor("black")
            .text(name, columns[0], y, { width: columns[3] - columns[0] })
            .text(description, columns[4], y)
            .text(price, columns[6], y)
            .text(amount, columns[7], y)
            .text(tax, columns[8], y)
            .text(subtotal, columns[9], y);
        }
      };

      const generateInvoiceTable = (doc, documentProducts, y) => {
        let invoiceTableTop = y;
        generateTableRow(doc, invoiceTableTop + 15, "Name", "Description", "Price", "Amount", "Tax", "Subtotal", true);
        for (let i = 1; i <= documentProducts.length; i++) {
          const item = documentProducts[i - 1];
          const position = invoiceTableTop + i * 40;
          generateTableRow(
            doc,
            position,
            item.name,
            item.description,
            formatCurrency(item.value.toFixed(2)),
            item.amount,
            formatCurrency(Number(item.subTotalTax).toFixed(2)),
            formatCurrency(Number(item.subTotal).toFixed(2))
          );
        }
        return invoiceTableTop + (documentProducts.length + 1) * 40;
      };

      const bankDetails = ({ doc, x, y, establishment }) => {
        let strings = [];
        if (establishment.bankAccount1) {
          strings.push(establishment.bankAccount1);
        }
        if (establishment.bankAccount2 !== null) {
          strings.push(establishment.bankAccount2);
        }
        if (establishment.bankAccount3 !== null) {
          strings.push(establishment.bankAccount3);
        }
        strings.map((string, index) => {
          doc.text(string, x, y + index * 15);
        });
      };

      const customerDetails = ({ doc, x, y, invoiceDoc }) => {
        let strings = [];
        const customer = invoiceDoc.customer;
        const docAddress = invoiceDoc.delAddress;

        if (customer.customerCompany) {
          strings.push(customer.customerCompany);
        }

        if (customer.customerTaxNumber) {
          strings.push(customer.customerTaxNumber);
        }

        if (customer.phone) {
          strings.push(customer.phone);
        }

        strings.push(docAddress.street + " " + docAddress.door);
        if (docAddress.floor) {
          strings.push("floor: " + docAddress.floor);
        }
        strings.push(docAddress.zip + " " + docAddress.city + " " + docAddress.country);

        strings.map((string, index) => {
          doc.text(string, x, y + index * 15);
        });
        return y + strings.length * 15;
      };

      const paymentsTable = ({ doc, x, y, payments }) => {
        doc
          .lineCap("butt")
          .moveTo(x, y)
          .lineTo(x + 230, y)
          .stroke("black");

        doc.fillColor("white").text("Payment History:", x + 10, y - 5);

        doc.fillColor("black");

        payments.forEach((payment, i) => {
          doc.text(dateFormatBe(payment.date), x + 10, y + 20 * (i + 1));
          doc.text(payment.type, x + 85, y + 20 * (i + 1));
          doc.text(formatCurrency(payment.value.toFixed(2)), x + 150, y + 20 * (i + 1), {
            width: 40,
            align: "right",
          });
        });
      };

      const taxTable = ({ doc, x, y, documentProducts }) => {
        let taxRates = [];

        documentProducts.forEach((docProd, i) => {
          if (!taxRates.includes(docProd.tax)) {
            taxRates.push(docProd.tax);
          }
        });

        taxRates = taxRates.sort((a, b) => a - b);

        // Totals
        doc.fontSize(10).text("Total Tax:", x, y + 50);
        doc.text(formatCurrency(documentProducts.reduce((acc, dp) => acc + Number(dp.subTotalTax), 0)), x + 80, y + 50);

        taxRates.map((taxRate, index) => {
          doc
            .text("Total Tax " + taxRate + "%:", x, y + 50 + (index + 1) * 15)
            .text(
              formatCurrency(documentProducts.filter((dp) => dp.tax === taxRate).reduce((acc, dp) => acc + Number(dp.subTotalTax), 0)),
              x + 80,
              y + 50 + (index + 1) * 15
            );
        });

        return y + taxRates.length * 15 + 50;
      };

      // Header
      doc.fontSize(20).text("INVOICE", 455, pageTop);

      // Invoice Details
      doc.fontSize(10).text("Invoice:", 380, 80);
      doc.text(invoiceDoc.number, 450, 80);
      doc.text("Date:", 380, 95);
      doc.text(dateFormatBe(invoiceDoc.date), 450, 95);
      doc.text("Valid Until:", 380, 110);
      doc.text(dateFormatBe(addDaysToDate(invoiceDoc.date, 15).toISOString()), 450, 110);
      doc.text("Delivery Date:", 380, 125);
      if (invoiceDoc.deliveryDate) {
        doc.text(dateFormatBe(invoiceDoc.deliveryDate), 450, 125);
      }

      let y = 140;

      // Establishment Details
      // Column 1
      doc.text(establishment.name, 50, y);
      doc.text(establishment.taxID, 50, y + 15);
      bankDetails({
        doc: doc,
        x: 50,
        y: y + 30,
        establishment: establishment,
      });

      // Column 2
      doc.text(establishmentAddress.street + " " + establishmentAddress.door, 200, y);
      doc.text(establishmentAddress.zip + " " + establishmentAddress.city, 200, y + 15);
      doc.text(establishment.phone, 200, y + 30);
      doc.text(establishment.phone2, 200, y + 45);

      // Customer Details
      doc.text("Order: " + invoiceDoc.references, 380, y);
      doc.text(invoiceDoc.customer.firstName + " " + invoiceDoc.customer.lastName, 380, y + 15);
      y = customerDetails({
        doc: doc,
        x: 380,
        y: y + 30,
        invoiceDoc: invoiceDoc,
      });

      y += 60;

      y = generateInvoiceTable(doc, invoiceDoc.documentProducts, y);

      if (y < 500) {
        y = 500;
      }

      taxTable({
        doc: doc,
        x: 30,
        y: y,
        documentProducts: invoiceDoc.documentProducts,
      });

      paymentsTable({ doc: doc, x: 170, y: y + 30, payments: invoiceDoc.payments });

      let totalsX = 410;
      doc.text("Total Excl. Tax:", totalsX, y + 50);
      doc.text(
        formatCurrency(
          invoiceDoc.documentProducts.reduce((acc, dp) => acc + Number(dp.subTotal), 0) -
            invoiceDoc.documentProducts.reduce((acc, dp) => acc + Number(dp.subTotalTax), 0)
        ),
        totalsX + 70,
        y + 50
      );
      doc.text("Total:", totalsX, y + 65);
      doc.text(formatCurrency(invoiceDoc.documentProducts.reduce((acc, dp) => acc + Number(dp.subTotal), 0)), totalsX + 70, y + 65);
      doc.text("Already Paid:", totalsX, y + 80);
      doc.text(
        formatCurrency(invoiceDoc.payments.filter((p) => p.isVerified && !p.isDeleted).reduce((acc, dp) => acc + Number(dp.value), 0)),
        totalsX + 70,
        y + 80
      );
      doc.text("To Pay:", totalsX, y + 95);
      doc.text(
        formatCurrency(
          invoiceDoc.documentProducts.reduce((acc, dp) => acc + Number(dp.subTotal), 0) -
            invoiceDoc.payments.filter((p) => p.isVerified && !p.isDeleted).reduce((acc, dp) => acc + Number(dp.value), 0)
        ),
        totalsX + 70,
        y + 95
      );

      //
      //
      //
      //
      // this part is being designed in simulation at the moment

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
