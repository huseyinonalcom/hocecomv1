import express from "express";
import payload from "payload";
import { createDocumentsFromBolOrders } from "./jobs/bol-offer-sync";

require("dotenv").config();
const app = express();

// Redirect root to Admin panel
app.get("/", (_, res) => {
  res.redirect("/admin");
});

const start = async () => {
  var cron = require("node-cron");

  // Initialize Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    express: app,
    onInit: async () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
    },
  });

  app.listen(3421);

  cron.schedule("*/10 * * * *", async () => {
    try {
      console.log("Cron job started");
      await createDocumentsFromBolOrders();
      console.log("Cron job completed successfully");
    } catch (error) {
      console.error("Error running cron job", error);
    }
  });
  // Add your own express routes here
};

start();
