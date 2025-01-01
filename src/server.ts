import { createDocumentsFromBolOrders } from "./jobs/bol-offer-sync";
import { bulkSendDocuments } from "./jobs/bulkdocumentsenderstart";
import { Company } from "./payload-types";
import express from "express";
import payload from "payload";
import { fixOrder } from "./utils/fixorder";

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

  if (process.env.FORCE_INVOICE_ON_STARTUP === "true" && process.env.MONTH_TO_SEND) {
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
      let currentYear = new Date().getFullYear() - 1;
      for (let company of companiesWithMonthlyReportsActive) {
        bulkSendDocuments({
          companyID: (company as unknown as Company).id,
          docTypes: ["invoice", "credit_note", "purchase"],
          month: Number(process.env.MONTH_TO_SEND), // last month
          year: currentYear, // Current yer
        });

        bulkSendDocuments({
          companyID: (company as unknown as Company).id,
          docTypes: ["invoice", "credit_note", "purchase"],
          month: Number(process.env.MONTH_TO_SEND) - 1, // last month
          year: currentYear, // Current yer
        });
        bulkSendDocuments({
          companyID: (company as unknown as Company).id,
          docTypes: ["invoice", "credit_note", "purchase"],
          month: Number(process.env.MONTH_TO_SEND) - 2, // last month
          year: currentYear, // Current yer
        });
        bulkSendDocuments({
          companyID: (company as unknown as Company).id,
          docTypes: ["invoice", "credit_note", "purchase"],
          month: Number(process.env.MONTH_TO_SEND) - 3, // last month
          year: currentYear, // Current yer
        });
        bulkSendDocuments({
          companyID: (company as unknown as Company).id,
          docTypes: ["invoice", "credit_note", "purchase"],
          month: Number(process.env.MONTH_TO_SEND) - 4, // last month
          year: currentYear, // Current yer
        });
        bulkSendDocuments({
          companyID: (company as unknown as Company).id,
          docTypes: ["invoice", "credit_note", "purchase"],
          month: Number(process.env.MONTH_TO_SEND) - 5, // last month
          year: currentYear, // Current yer
        });
      }
    } catch (error) {
      console.error("Error starting bulk document sender", error);
    }
  }

  app.listen(3421);
  if (process.env.FIX_ORDER === "true" && process.env.FIX_ORDER_COMPANY && process.env.FIRST && process.env.LAST) {
    try {
      fixOrder({
        firstOrderID: process.env.FIRST,
        lastOrderID: process.env.LAST,
        company: process.env.FIX_ORDER_COMPANY,
        type: "invoice",
      });
    } catch (error) {
      console.error("Error fixing doc order", error);
    }
  }

  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log("Running Cron Job for Bol Orders");
      createDocumentsFromBolOrders();
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
          docTypes: ["invoice", "credit_note", "purchase"],
          month: new Date().getMonth(), // last month
          year: currentYear, // Current year
        });
      }
    } catch (error) {
      console.error("Error starting bulk document sender", error);
    }
  });

  // Add your own express routes here
};

start();
