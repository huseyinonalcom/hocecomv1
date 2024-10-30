import express from "express";
import payload from "payload";
import { createDocumentsFromBolOrders } from "./jobs/bol-offer-sync";
import { bulkSendDocuments } from "./jobs/bulkdocumentsenderstart";
import { Company } from "./payload-types";

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

  cron.schedule("0 0 2 * *", async () => {
    try {
      let companiesWithMonthlyReportsActive = (
        await payload.find({
          collection: "companies",
          limit: 200,
          depth: 1,
          where: {
            monthlyReports: {
              equals: true,
            },
          },
        })
      ).docs;
      let currentYear = new Date().getFullYear();
      for (let company of companiesWithMonthlyReportsActive) {
        bulkSendDocuments({
          companyID: (company as unknown as Company).id,
          docTypes: ["invoice", "credit_note"],
          month: new Date().getMonth(), // last month
          year: currentYear, // Current year
        });
      }
    } catch (error) {
      console.error("Error starting bulk document sender", error);
    }
  });
  setTimeout(async () => {
    try {
      let companiesWithMonthlyReportsActive = (
        await payload.find({
          collection: "companies",
          limit: 200,
          depth: 1,
          where: {
            monthlyReports: {
              equals: true,
            },
          },
        })
      ).docs;
      let currentYear = new Date().getFullYear();
      for (let company of companiesWithMonthlyReportsActive) {
        bulkSendDocuments({
          companyID: (company as unknown as Company).id,
          docTypes: ["invoice", "credit_note"],
          month: new Date().getMonth(), // last month
          year: currentYear, // Current year
        });
        bulkSendDocuments({
          companyID: (company as unknown as Company).id,
          docTypes: ["invoice", "credit_note"],
          month: new Date().getMonth() - 1, // last month
          year: currentYear, // Current year
        });
        bulkSendDocuments({
          companyID: (company as unknown as Company).id,
          docTypes: ["invoice", "credit_note"],
          month: new Date().getMonth() - 2, // last month
          year: currentYear, // Current year
        });
        bulkSendDocuments({
          companyID: (company as unknown as Company).id,
          docTypes: ["invoice", "credit_note"],
          month: new Date().getMonth() - 3, // last month
          year: currentYear, // Current year
        });
      }
    } catch (error) {
      console.error("Error starting bulk document sender", error);
    }
  }, 10000);

  // Add your own express routes here
};

start();
