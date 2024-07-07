import payload from "payload";
import { generateRandomString } from "../utils/random";
import { Company } from "payload/generated-types";

const bolAuthUrl = "https://login.bol.com/token?grant_type=client_credentials";

const bolApiUrl = "https://api.bol.com/retailer";

let bolToken;
let bolTokenExpiration;
let companiesToSync: Company[] = [];

function bolHeaders(headersType: "csv" | "json") {
  if (headersType === "json") {
    return {
      "Content-Type": "application/vnd.retailer.v9+json",
      Accept: "application/vnd.retailer.v9+json",
      Authorization: `Bearer ${bolToken}`,
    };
  } else if (headersType === "csv") {
    return {
      "Content-Type": "application/vnd.retailer.v9+csv",
      Accept: "application/vnd.retailer.v9+csv",
      Authorization: `Bearer ${bolToken}`,
    };
  }
}

async function authenticateBolCom(clientId, clientSecret) {
  if (bolTokenExpiration && bolTokenExpiration > new Date()) {
    return true;
  }

  const authHeader = `Basic ${btoa(`${clientId}:${clientSecret}`)}`;

  try {
    const response = await fetch(bolAuthUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      console.log("Failed to authenticate bol.com");
      return false;
    }

    const data = await response.json();
    bolToken = data["access_token"];
    bolTokenExpiration = new Date(new Date().getTime() + data["expires_in"] * 1000);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function getBolComOrders(bolClientID, bolClientSecret) {
  await authenticateBolCom(bolClientID, bolClientSecret);

  let today = new Date();
  let todayString = today.toISOString().split("T")[0];

  try {
    const response = await fetch(`${bolApiUrl}/orders?fulfilment-method=FBR&status=ALL&latest-change-date=${todayString}&page=1`, {
      method: "GET",
      headers: bolHeaders("json"),
    });

    if (!response.ok) {
      console.log("Failed to fetch bol.com orders");
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function getBolComOrder(orderId, bolClientID, bolClientSecret) {
  await authenticateBolCom(bolClientID, bolClientSecret);

  try {
    const response = await fetch(`${bolApiUrl}/orders/${orderId}`, {
      method: "GET",
      headers: bolHeaders("json"),
    });

    if (!response.ok) {
      console.log("Failed to fetch bol.com order");
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export const createDocumentsFromBolOrders = async () => {
  payload
    .find({
      overrideAccess: true,
      collection: "companies",
      depth: 2,
      limit: 1000,
      where: {
        and: [{ bolClientID: { exists: true } }, { bolClientSecret: { exists: true } }],
      },
    })
    .then((companies) => {
      companies.docs.forEach((company) => companiesToSync.push(company));
    })
    .then(async () => {
      for (let i = 0; i < companiesToSync.length; i++) {
        const currCompany = companiesToSync[i];
        await authenticateBolCom(currCompany.bolClientID, currCompany.bolClientSecret);
        getBolComOrders(currCompany.bolClientID, currCompany.bolClientSecret).then(async (orders) => {
          if (orders && orders.orders.length > 0) {
            for (let i = 0; i < orders.orders.length; i++) {
              await getBolComOrder(orders.orders[i].orderId, currCompany.bolClientID, currCompany.bolClientSecret).then(async (orderDetails) => {
                orderDetails && (await saveDocument(orderDetails, currCompany.id));
              });
            }
          }
        });
      }
    });
};

const saveDocument = async (bolDoc, company) => {
  try {
    const creator = await payload.find({
      overrideAccess: true,
      collection: "users",
      where: {
        company: {
          equals: company,
        },
        role: {
          equals: "admin",
        },
      },
    });
    const existingDoc = await payload.find({
      user: creator.docs[0],
      collection: "documents",
      where: {
        references: {
          equals: bolDoc.orderId,
        },
      },
    });
    if (existingDoc.docs.length > 0) {
      return;
    }
    const establishment = await payload.find({
      user: creator.docs[0],
      collection: "establishments",
      where: {
        company: {
          equals: company,
        },
      },
    });

    let docAddress = null;
    let delAddress = null;

    const tramsformEmail = (email) => {
      let parts = email.split("@");
      let localPart = parts[0].split("+")[0];
      let domainPart = parts[1];
      return localPart + "+" + company + "@" + domainPart;
    };

    const existingCustomer = await payload.find({
      user: creator.docs[0],
      depth: 3,
      collection: "users",
      where: {
        email: {
          equals: tramsformEmail(bolDoc.billingDetails.email),
        },
      },
    });
    let user;
    if (existingCustomer.docs.length > 0) {
      user = existingCustomer.docs[0];

      if (user.customerAddresses && user.customerAddresses.length > 0) {
        for (let i = 0; i < user.customerAddresses.length; i++) {
          if (
            user.customerAddresses[i].street === bolDoc.shipmentDetails.streetName &&
            user.customerAddresses[i].door === bolDoc.shipmentDetails.houseNumber &&
            user.customerAddresses[i].zip === bolDoc.shipmentDetails.zipCode &&
            user.customerAddresses[i].city === bolDoc.shipmentDetails.city &&
            user.customerAddresses[i].country === bolDoc.shipmentDetails.countryCode
          ) {
            delAddress = user.customerAddresses[i];
          }
          if (
            user.customerAddresses[i].street === bolDoc.billingDetails.streetName &&
            user.customerAddresses[i].door === bolDoc.billingDetails.houseNumber &&
            user.customerAddresses[i].zip === bolDoc.billingDetails.zipCode &&
            user.customerAddresses[i].city === bolDoc.billingDetails.city &&
            user.customerAddresses[i].country === bolDoc.billingDetails.countryCode
          ) {
            docAddress = user.customerAddresses[i];
          }
        }
      }
    } else {
      delAddress = await payload.create({
        user: creator.docs[0],
        collection: "addresses",
        data: {
          street: bolDoc.shipmentDetails.streetName,
          door: bolDoc.shipmentDetails.houseNumber,
          zip: bolDoc.shipmentDetails.zipCode,
          city: bolDoc.shipmentDetails.city,
          country: bolDoc.shipmentDetails.countryCode,
          company: company,
        },
      });
      docAddress = await payload.create({
        user: creator.docs[0],
        collection: "addresses",
        data: {
          street: bolDoc.billingDetails.streetName,
          door: bolDoc.billingDetails.houseNumber,
          zip: bolDoc.billingDetails.zipCode,
          city: bolDoc.billingDetails.city,
          country: bolDoc.billingDetails.countryCode,
          company: company,
        },
      });
      const newUser = await payload.create({
        user: creator.docs[0],
        collection: "users",
        data: {
          email: bolDoc.billingDetails.email,
          preferredLanguage: bolDoc.shipmentDetails.language,
          phone: bolDoc.shipmentDetails.phone,
          customerAddresses: [docAddress.id, delAddress.id],
          password: generateRandomString(24),
          role: "customer",
          firstName: bolDoc.billingDetails.firstName,
          lastName: bolDoc.billingDetails.surname,
          company: company,
        },
      });
      user = newUser;
    }
    if (!delAddress) {
      delAddress = await payload.create({
        user: creator.docs[0],
        collection: "addresses",
        data: {
          street: bolDoc.shipmentDetails.streetName,
          door: bolDoc.shipmentDetails.houseNumber,
          zip: bolDoc.shipmentDetails.zipCode,
          city: bolDoc.shipmentDetails.city,
          country: bolDoc.shipmentDetails.countryCode,
          company: company,
        },
      });
    }
    if (!docAddress) {
      docAddress = await payload.create({
        user: creator.docs[0],
        collection: "addresses",
        data: {
          street: bolDoc.billingDetails.streetName,
          door: bolDoc.billingDetails.houseNumber,
          zip: bolDoc.billingDetails.zipCode,
          city: bolDoc.billingDetails.city,
          country: bolDoc.billingDetails.countryCode,
          company: company,
        },
      });
    }

    let documentProducts = [];
    for (let i = 0; i < bolDoc.orderItems.length; i++) {
      const products = await payload.find({
        user: creator.docs[0],
        collection: "products",
        where: {
          EAN: {
            equals: bolDoc.orderItems[i].product.ean,
          },
        },
      });
      documentProducts.push(
        await payload.create({
          user: creator.docs[0],
          collection: "document-products",
          data: {
            value: bolDoc.orderItems[i].unitPrice,
            company: company,
            product: products && products.docs.length > 0 ? products.docs[0].id : null,
            amount: bolDoc.orderItems[i].quantity,
            tax: 21,
            name: products && products.docs.length > 0 ? products.docs[0].name : bolDoc.orderItems[i].product.title,
          },
        })
      );
    }
    const document = await payload.create({
      user: creator.docs[0],
      collection: "documents",
      data: {
        number: bolDoc.orderId,
        prefix: "BOL-",
        date: bolDoc.orderPlacedDateTime.split("T"),
        time: bolDoc.orderPlacedDateTime.split("T")[1].split("+")[0],
        documentProducts: documentProducts.map((dp) => dp.id),
        customer: user.id,
        company: company,
        references: bolDoc.orderId,
        delAddress: delAddress.id,
        docAddress: docAddress.id,
        creator: creator.docs[0].id,
        establishment: establishment.docs[0].id,
        type: "invoice",
      },
    });
    console.log({ document });
    // const payment = await payload.create({
    //   user: creator.docs[0],
    //   collection: "payments",
    //   data: {
    //     value: document,
    //     type: "online",
    //     isVerified: true,
    //     document: document.id,
    //     company: company,
    //   },
    // });
  } catch (error) {
    console.log(error);
  }
};
