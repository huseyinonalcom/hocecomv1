import payload from "payload";

export function bolOfferSync() {
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
}
