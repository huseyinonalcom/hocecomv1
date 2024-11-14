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
      console.log(ordersToSort);
      // take all the numbers into an array
      let numbers = ordersToSort.docs.map((order) => Number(order.number));

      // sort ordersToSort on time, time can be null, in that case treat null as 00:00:00

      ordersToSort.docs.sort((a, b) => {
        const timeA = a.time || "00:00:00";
        const timeB = b.time || "00:00:00";

        // Convert time strings to Date objects for comparison
        const dateA = new Date(`1970-01-01T${timeA}Z`);
        const dateB = new Date(`1970-01-01T${timeB}Z`);

        // Compare the dates
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
      console.log(
        ordersToSort.docs.map((order) => {
          order.number, order.date, order.date;
        })
      );
      let newOrders = [];
      for (let i = 0; i < ordersToSort.docs.length; i++) {
        newOrders.push({
          date: ordersToSort.docs[i].date,
          number: numbers[i],
          time: ordersToSort.docs[i].time,
        });
      }
      console.log(newOrders);
      //   for (let order of ordersToSort.docs) {
      //     await payload.update({
      //       collection: "documents",
      //       id: order.id,
      //       data: {
      //         number: order.number,
      //       },
      //       overrideAccess: true,
      //     });
      //   }
    }
  } catch (error) {
    console.error(error);
    return false;
  }

  return true;
};
