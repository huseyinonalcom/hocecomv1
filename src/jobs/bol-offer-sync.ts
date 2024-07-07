import payload from "payload";
import { generateRandomString } from "../utils/random";
import { Company } from "payload/generated-types";

const bolAuthUrl = "https://login.bol.com/token?grant_type=client_credentials";

const bolApiUrl = "https://api.bol.com/retailer";

let bolToken;
let bolTokenExpiration;
let companiesToSync: Company[] = [];

const BolHeadersType = {
  JSON: "json",
  CSV: "csv",
};

function bolHeaders(headersType) {
  if (headersType === BolHeadersType.JSON) {
    return {
      "Content-Type": "application/vnd.retailer.v9+json",
      Accept: "application/vnd.retailer.v9+json",
      Authorization: `Bearer ${bolToken}`,
    };
  } else if (headersType === BolHeadersType.CSV) {
    return {
      "Content-Type": "application/vnd.retailer.v9+csv",
      Accept: "application/vnd.retailer.v9+csv",
      Authorization: `Bearer ${bolToken}`,
    };
  } else {
    throw new Error("Invalid headers type for bol request");
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
      throw new Error("Failed to authenticate bol.com");
    }

    const data = await response.json();
    bolToken = data["access_token"];
    bolTokenExpiration = new Date(new Date().getTime() + data["expires_in"] * 1000);
    return true;
  } catch (error) {
    throw new Error("Failed to authenticate bol.com");
  }
}

async function getBolComOrders(bolClientID, bolClientSecret) {
  await authenticateBolCom(bolClientID, bolClientSecret);

  let today = new Date();
  let todayString = today.toISOString().split("T")[0];

  try {
    const response = await fetch(`${bolApiUrl}/orders?fulfilment-method=FBR&status=ALL&latest-change-date=${todayString}&page=1`, {
      method: "GET",
      headers: bolHeaders(BolHeadersType.JSON),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch bol.com orders");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Failed to fetch bol.com orders");
  }
}

async function getBolComOrder(orderId, bolClientID, bolClientSecret) {
  await authenticateBolCom(bolClientID, bolClientSecret);

  try {
    const response = await fetch(`${bolApiUrl}/orders/${orderId}`, {
      method: "GET",
      headers: bolHeaders(BolHeadersType.JSON),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch bol.com order");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Failed to fetch bol.com order");
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
    .then(() => {
      for (let i = 0; i < companiesToSync.length; i++) {
        console.log("syncing for: ", companiesToSync[i]);
        const currCompany = companiesToSync[i];
        authenticateBolCom(currCompany.bolClientID, currCompany.bolClientSecret);
        getBolComOrders(currCompany.bolClientID, currCompany.bolClientSecret).then((orders) => {
          orders.orders.forEach((order) => {
            getBolComOrder(order.orderId, currCompany.bolClientID, currCompany.bolClientSecret).then((orderDetails) => {
              saveDocument(orderDetails, currCompany.id);
            });
          });
        });
      }
    });
};

const saveDocument = async (bolDoc, company) => {
  try {
    console.log("looking for user");
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
    console.log("creator: ", creator);
    console.log("looking for document");
    const existingDoc = await payload.find({
      user: creator.docs[0],
      collection: "documents",
      where: {
        number: {
          equals: bolDoc.orderId,
        },
      },
    });
    if (existingDoc.docs.length > 0) {
      return;
    }
    console.log("creating address doc");
    const docAddress = await payload.create({
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
    console.log("creating address del");
    const delAddress = await payload.create({
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
    console.log("creating user");
    const user = await payload.create({
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
    console.log("creating document products");
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
    console.log("creating document ");
    await payload.create({
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
        creator: creator.docs[0].id,
        type: "order",
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to save document");
  }
};