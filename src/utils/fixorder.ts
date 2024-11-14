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
