import payload from "payload";

const bolAuthUrl = "https://login.bol.com/token?grant_type=client_credentials";

const bolApiUrl = "https://api.bol.com/retailer";

let bolToken;
let bolTokenExpiration;
let companiesToSync;

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

  try {
    const response = await fetch(`${bolApiUrl}/orders`, {
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
      collection: "companies",
      depth: 1,
      limit: 1000,
      where: {
        and: [{ bolClientID: { exists: true } }, { bolClientSecret: { exists: true } }],
      },
    })
    .then((companies) => {
      companies.docs.forEach((company) =>
        companiesToSync.push({ companyID: company.id, bolClientID: company.bolClientID, bolClientSecret: company.bolClientSecret })
      );
    })
    .then(() => {
      for (let i = 0; i < companiesToSync.length; i++) {
        const currCompany = companiesToSync[i];
        authenticateBolCom(currCompany.bolClientID, currCompany.bolClientSecret);
        getBolComOrders(currCompany.bolClientID, currCompany.bolClientSecret).then((orders) => {
          orders.forEach((order) => {
            getBolComOrder(order.id, currCompany.bolClientID, currCompany.bolClientSecret).then((orderDetails) => {
              console.log(orderDetails);
              // Create documents from orderDetails
            });
          });
        });
      }
    });
};
