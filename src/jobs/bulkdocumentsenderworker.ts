import fs from "fs-extra";
import path from "path";
import archiver from "archiver";
import { workerData } from "worker_threads";
import os from "os";
import { Document, Establishment, Logo } from "payload/generated-types";
import { generateInvoice } from "../utils/invoicepdf";
import { sendMail } from "../utils/sendmail";
import { dateFormatBe, dateFormatOnlyDate } from "../utils/formatters/dateformatters";
import { documentToXml } from "../utils/xml/ayfemaxml";

const documents = workerData.documents;
const company = workerData.company;

async function writeAllXmlsToTempDir(tempDir: string, documents: Document[]): Promise<string[]> {
  await fs.ensureDir(tempDir);

  const filePaths = await Promise.all(
    documents.map(async (document) => {
      let xml = documentToXml(document);
      const filePath = path.join(tempDir, xml.filename);
      await fs.writeFile(filePath, xml.content);

      return filePath;
    })
  );

  return filePaths;
}

async function writeAllPdfsToTempDir(tempDir: string, documents: Document[]): Promise<string[]> {
  const response = await fetch(((documents.at(0).establishment as Establishment).logo as Logo).url);
  let logoBuffer = await Buffer.from(await response.arrayBuffer());
  await fs.ensureDir(tempDir);

  const filePaths = await Promise.all(
    documents.map(async (document) => {
      const filePath = path.join(tempDir, `${document.type}_${document.prefix ?? ""}${document.number}.pdf`);
      let pdf;
      try {
        pdf = await generateInvoice({
          document: document,
          logoBuffer: logoBuffer,
        });
      } catch (error) {
        pdf = null;
        throw new Error(error);
      }
      await fs.writeFile(filePath, pdf.content);

      return filePath;
    })
  );

  return filePaths;
}

async function createZip(tempDir: string, zipPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const buffers: Buffer[] = [];
    const archive = archiver("zip", { zlib: { level: 5 } });

    archive.on("data", (chunk: Buffer) => {
      buffers.push(chunk);
    });

    archive.on("error", (err) => {
      console.error("Error with archive:", err);
      reject(err);
    });

    archive.on("end", () => {
      try {
        fs.writeFileSync(zipPath, Buffer.concat(buffers));
        resolve();
      } catch (error) {
        reject(error);
      }
    });

    archive.directory(tempDir, false);

    archive
      .finalize()
      .then(() => {})
      .catch((err) => {
        console.error("Error finalizing archive:", err);
        reject(err);
      });
  });
}

async function sendEmailWithAttachment(zipPath: string): Promise<void> {
  await sendMail({
    recipient: company.accountantEmail,
    subject: `Documenten ${company.name} ${dateFormatBe(documents.at(0).date)} - ${dateFormatBe(documents.at(-1).date)}`,
    company: company,
    attachments: [
      {
        filename: zipPath.split("/").pop(),
        path: zipPath,
      },
    ],
    html: `<p>Beste, in bijlage alle documenten van ${company.name} voor het periode tussen ${dateFormatBe(documents.at(0).date) + " en " + dateFormatBe(documents.at(-1).date)}.</p>`,
  });
}

const run = async () => {
  try {
    console.log(documents.at(0));
    const tempDir = path.join(os.tmpdir(), "pdf_temp" + company.id + dateFormatOnlyDate(documents.at(0).date));
    await fs.emptyDir(tempDir);
    await writeAllPdfsToTempDir(tempDir, documents);
    await writeAllXmlsToTempDir(tempDir, documents);
    const zipPath = path.join(
      tempDir,
      "documents_" + company.name + "_" + dateFormatOnlyDate(documents.at(0).date) + "_" + dateFormatOnlyDate(documents.at(-1).date) + ".zip"
    );
    await createZip(tempDir, zipPath);
    await sendEmailWithAttachment(zipPath);
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

run();
