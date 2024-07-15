import payload from "payload";
import { generateRandomString } from "../utils/random";
import { Company } from "payload/generated-types";
import { sendMail } from "../utils/sendmail";
import { generateInvoice } from "../utils/invoicepdf";

const bolAuthUrl = "https://login.bol.com/token?grant_type=client_credentials";

const bolApiUrl = "https://api.bol.com/retailer";

let bolTokens = [];
let companiesToSync: Company[] = [];

function bolHeaders(headersType, clientId) {
  const tokenEntry = bolTokens.find((t) => t.clientId === clientId);
  if (!tokenEntry) {
    console.log("Token not found for clientId:", clientId);
    return;
  }

  const contentType = headersType === "json" ? "application/vnd.retailer.v9+json" : "application/vnd.retailer.v9+csv";
  return {
    "Content-Type": contentType,
    Accept: contentType,
    Authorization: `Bearer ${tokenEntry.token}`,
  };
}

async function authenticateBolCom(clientId, clientSecret) {
  const existingTokenEntry = bolTokens.find((t) => t.clientId === clientId);

  if (existingTokenEntry && new Date() < existingTokenEntry.expiration) {
    return existingTokenEntry.token;
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
    const newToken = {
      clientId,
      token: data["access_token"],
      expiration: new Date(new Date().getTime() + data["expires_in"] * 1000),
    };

    if (existingTokenEntry) {
      existingTokenEntry.token = newToken.token;
      existingTokenEntry.expiration = newToken.expiration;
    } else {
      bolTokens.push(newToken);
    }

    return newToken.token;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export const createDocumentsFromBolOrders = async () => {
  companiesToSync = [];
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
        getBolComOrders(currCompany.bolClientID, currCompany.bolClientSecret).then(async (orders) => {
          if (orders && orders.orders && orders.orders.length > 0) {
            for (let i = 0; i < orders.orders.length; i++) {
              await getBolComOrder(
                orders.orders.sort((a, b) => new Date(a.orderPlacedDateTime).getTime() - new Date(b.orderPlacedDateTime).getTime())[i].orderId,
                currCompany.bolClientID,
                currCompany.bolClientSecret
              ).then(async (orderDetails) => {
                orderDetails && (await saveDocument(orderDetails, currCompany));
              });
            }
          }
        });
      }
    });
};

async function getBolComOrders(bolClientID, bolClientSecret) {
  await authenticateBolCom(bolClientID, bolClientSecret);

  let today = new Date();
  let todayString = today.toISOString().split("T")[0];

  try {
    const response = await fetch(`${bolApiUrl}/orders?fulfilment-method=FBR&status=ALL&latest-change-date=${todayString}&page=1`, {
      method: "GET",
      headers: bolHeaders("json", bolClientID),
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
      headers: bolHeaders("json", bolClientID),
    });

    if (!response.ok) {
      console.log("Failed to fetch bol.com order");
      const answer = await response.text();
      console.log(answer);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

const saveDocument = async (bolDoc, company) => {
  try {
    const creator = await payload.find({
      overrideAccess: true,
      collection: "users",
      where: {
        company: {
          equals: company.id,
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
          equals: company.id,
        },
      },
    });

    let docAddress = null;
    let delAddress = null;

    const tramsformEmail = (email) => {
      let parts = email.split("@");
      let localPart = parts[0].split("+")[0];
      let domainPart = parts[1];
      return localPart + "+" + company.id + "@" + domainPart;
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
          company: company.id,
        },
      });
      if (bolDoc.shipmentDetails.streetName !== bolDoc.billingDetails.streetName) {
        docAddress = await payload.create({
          user: creator.docs[0],
          collection: "addresses",
          data: {
            street: bolDoc.billingDetails.streetName,
            door: bolDoc.billingDetails.houseNumber,
            zip: bolDoc.billingDetails.zipCode,
            city: bolDoc.billingDetails.city,
            country: bolDoc.billingDetails.countryCode,
            company: company.id,
          },
        });
      } else {
        docAddress = delAddress;
      }
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
          company: company.id,
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
          company: company.id,
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
          company: company.id,
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
            company: company.id,
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
        date: bolDoc.orderPlacedDateTime.split("T"),
        time: bolDoc.orderPlacedDateTime.split("T")[1].split("+")[0],
        documentProducts: documentProducts.map((dp) => dp.id),
        customer: user.id,
        company: company.id,
        references: bolDoc.orderId,
        delAddress: delAddress.id,
        docAddress: docAddress.id,
        creator: creator.docs[0].id,
        establishment: establishment.docs[0].id,
        type: "invoice",
      },
    });
    const payment = await payload.create({
      user: creator.docs[0],
      collection: "payments",
      data: {
        value: document.documentProducts.reduce((acc, dp) => acc + dp.subTotal, 0),
        type: "online",
        isVerified: true,
        document: document.id,
        date: bolDoc.orderPlacedDateTime.split("T"),
        creator: creator.docs[0].id,
        company: company.id,
        establishment: establishment.docs[0].id,
      },
    });

    await payload.update({
      user: creator.docs[0],
      collection: "documents",
      id: document.id,
      data: {
        payments: [payment.id],
      },
    });

    await payload.update({
      user: creator.docs[0],
      collection: "users",
      id: user.id,
      data: {
        documents: [...user.documents.map((doc) => doc.id), document.id],
      },
    });

    await sendMail({
      recipient: company.accountantEmail,
      subject: `Bestelling ${document.prefix ?? ""}${document.number}`,
      company: company,
      attachments: [await generateInvoice({ document, establishment })],
      html: `<p>Beste ${
        document.customer.firstName + " " + document.customer.lastName
      },</p><p>In bijlage vindt u het factuur voor uw laatste bestelling bij ons.</p><p>Met vriendelijke groeten.</p><p>${company.name}</p>`,
    });
  } catch (error) {
    console.log(error);
  }
};
