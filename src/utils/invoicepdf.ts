import { Document } from "payload/generated-types";
import { PDFInvoice } from "./pdf/invoice-pdf";
import { pdf } from "@react-pdf/renderer";

export async function generateInvoice({ document }: { document: Document }): Promise<{ filename: string; content: any; contentType: string }> {
  return {
    filename: `invoice_${document.number}.pdf`,
    content: await pdf(PDFInvoice({ invoiceDocument: document })).toBlob(),
    contentType: "application/pdf",
  };
}
