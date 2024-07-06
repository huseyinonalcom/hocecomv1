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

  cron.schedule("*/5 * * * *", () => {
    console.log("bol offers check");
    payload
      .find({
        collection: "companies",
        depth: 1,
        where: {
          and: [{ bolClientID: { exists: true } }, { bolClientSecret: { exists: true } }],
        },
      })
      .then((companies) => {
        companies.docs.forEach((company) => console.log(company.name + " " + company.bolClientID + " " + company.bolClientSecret));
      });
  });
  // Add your own express routes here
};

start();
