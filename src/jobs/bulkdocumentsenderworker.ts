import fs from "fs-extra";
import path from "path";
import archiver from "archiver";
import { workerData } from "worker_threads";
import os from "os";
import { Document } from "payload/generated-types";
import { generateInvoice } from "../utils/invoicepdf";
import { sendMail } from "../utils/sendmail";

const documents = workerData.documents;
const company = workerData.company;

async function writeAllPdfsToTempDir(tempDir: string, documents: Document[]): Promise<string[]> {
  await fs.ensureDir(tempDir);

  const filePaths = await Promise.all(
    documents.map(async (document) => {
      const filePath = path.join(tempDir, `${document.type}_${document.prefix ?? ""}${document.number}.pdf`);
      let pdf;
      try {
        pdf = await generateInvoice({
          document: document,
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
      .then(() => {
        console.log("Archive finalized and flushed.");
      })
      .catch((err) => {
        console.error("Error finalizing archive:", err);
        reject(err);
      });
  });
}

async function sendEmailWithAttachment(zipPath: string): Promise<void> {
  await sendMail({
    recipient: "huseyin-_-onal@hotmail.com",
    subject: `zip test`,
    company: company,
    attachments: [
      {
        filename: "files.zip",
        path: zipPath,
      },
    ],
    html: `<p>Beste</p>`,
  });
}

const run = async () => {
  try {
    const tempDir = path.join(os.tmpdir(), "pdf_temp");
    await fs.emptyDir(tempDir);
    await writeAllPdfsToTempDir(tempDir, documents);
    const zipPath = path.join(tempDir, "pdfs.zip");
    await createZip(tempDir, zipPath);
    await sendEmailWithAttachment(zipPath);
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

run();
