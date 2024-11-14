import payload from "payload";

export const fixOrder = async ({ firstOrderID, lastOrderID, company, type }: { firstOrderID: string; lastOrderID: string; company: string; type: string }) => {
  try {
    const ordersToSort = await payload.find({
      collection: "documents",
      where: {
        and: [
          {
            company: {
              equals: company,
            },
          },
          {
            type: {
              equals: type,
            },
          },
          {
            id: {
              greater_than_equal: firstOrderID,
            },
          },
          {
            id: {
              less_than_equal: lastOrderID,
            },
          },
        ],
      },
      limit: 1000,
      overrideAccess: true,
    });

    if (ordersToSort.docs.length > 0) {
      let numbers = ordersToSort.docs.map((order) => Number(order.number));
      numbers.reverse();

      ordersToSort.docs.sort((a, b) => {
        const timeA = a.time || "00:00:00";
        const timeB = b.time || "00:00:00";

        const dateA = new Date(`1970-01-01T${timeA}Z`);
        const dateB = new Date(`1970-01-01T${timeB}Z`);

        if (dateA > dateB) {
          return 1;
        } else if (dateA < dateB) {
          return -1;
        } else {
          return 0;
        }
      });

      ordersToSort.docs.sort((a, b) => {
        if (a.date > b.date) {
          return 1;
        } else if (a.date < b.date) {
          return -1;
        } else {
          return 0;
        }
      });
      let newOrders = [];
      for (let i = 0; i < ordersToSort.docs.length; i++) {
        newOrders.push({
          id: ordersToSort.docs[i].id,
          number: numbers[i],
        });
      }
      for (let order of newOrders) {
        await payload.update({
          collection: "documents",
          id: order.id,
          data: {
            number: order.number.toFixed(0),
          },
          overrideAccess: true,
        });
      }
    }
  } catch (error) {
    console.error(error);
    return false;
  }

  return true;
};
