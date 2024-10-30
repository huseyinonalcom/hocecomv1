import express from "express";
import payload from "payload";
import { createDocumentsFromBolOrders } from "./jobs/bol-offer-sync";
import { bulkSendDocuments } from "./jobs/bulkdocumentsenderstart";

require("dotenv").config();
const app = express();

app.get("/", (_, res) => {
  res.redirect("/admin");
});

const start = async () => {
  var cron = require("node-cron");

  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    express: app,
    onInit: async () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
    },
  });

  app.listen(3421);

  cron.schedule("*/5 * * * *", async () => {
    try {
      await createDocumentsFromBolOrders();
    } catch (error) {
      console.error("Error running cron job", error);
    }
  });

  setTimeout(() => {
    try {
      bulkSendDocuments({
        companyID: 3,
        docTypes: ["invoice", "credit_note"],
        month: 7,
        year: 2024,
      });
      bulkSendDocuments({
        companyID: 3,
        docTypes: ["invoice", "credit_note"],
        month: 8,
        year: 2024,
      });
      bulkSendDocuments({
        companyID: 3,
        docTypes: ["invoice", "credit_note"],
        month: 9,
        year: 2024,
      });
      bulkSendDocuments({
        companyID: 3,
        docTypes: ["invoice", "credit_note"],
        month: 10,
        year: 2024,
      });
    } catch (error) {
      console.error("Error starting bulk document sender", error);
    }
  }, 30000);

  // Add your own express routes here
};

start();
