import express from "express";
import payload from "payload";

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

  cron.schedule("*/1 * * * *", () => {
    console.log("running a task every minute?");
  });
  // Add your own express routes here
};

start();
