import express from "express";
import payload from "payload";
import { createDocumentsFromBolOrders } from "./jobs/bol-offer-sync";
import { bulkSendDocuments } from "./jobs/bulkdocumentsenderstart";
import { Company } from "./payload-types";
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

  app.listen(3421);

  payload.update({
    collection: "documents",
    id: "15457",
    data: {
    number: "20240000009",  
    },
    overrideAccess: true,
  });

  try {
    fixOrder({
      firstOrderID: "15284",
      lastOrderID: "15455",
      company: "3",
      type: "quote",
    });
  } catch (error) {
    console.error("Error fixing doc order", error);
  }

  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log("Running Cron Job for Bol Orders");
      await createDocumentsFromBolOrders();
      console.log("Finished Cron Job for Bol Orders");
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
  // setTimeout(async () => {
  //   try {
  //     let companiesWithMonthlyReportsActive = (
  //       await payload.find({
  //         collection: "companies",
  //         limit: 200,
  //         depth: 1,
  //         where: {
  //           monthlyReports: {
  //             equals: true,
  //           },
  //         },
  //       })
  //     ).docs;
  //     let currentYear = new Date().getFullYear();
  //     for (let company of companiesWithMonthlyReportsActive) {
  //       bulkSendDocuments({
  //         companyID: (company as unknown as Company).id,
  //         docTypes: ["invoice", "credit_note"],
  //         month: new Date().getMonth(), // last month
  //         year: currentYear, // Current year
  //       });
  //       bulkSendDocuments({
  //         companyID: (company as unknown as Company).id,
  //         docTypes: ["invoice", "credit_note"],
  //         month: new Date().getMonth() - 1, // last month
  //         year: currentYear, // Current year
  //       });
  //       bulkSendDocuments({
  //         companyID: (company as unknown as Company).id,
  //         docTypes: ["invoice", "credit_note"],
  //         month: new Date().getMonth() - 2, // last month
  //         year: currentYear, // Current year
  //       });
  //       bulkSendDocuments({
  //         companyID: (company as unknown as Company).id,
  //         docTypes: ["invoice", "credit_note"],
  //         month: new Date().getMonth() - 3, // last month
  //         year: currentYear, // Current year
  //       });
  //       bulkSendDocuments({
  //         companyID: (company as unknown as Company).id,
  //         docTypes: ["invoice", "credit_note"],
  //         month: new Date().getMonth() - 4, // last month
  //         year: currentYear, // Current year
  //       });
  //       bulkSendDocuments({
  //         companyID: (company as unknown as Company).id,
  //         docTypes: ["invoice", "credit_note"],
  //         month: new Date().getMonth() - 5, // last month
  //         year: currentYear, // Current year
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error starting bulk document sender", error);
  //   }
  // }, 10000);

  // Add your own express routes here
};

start();
