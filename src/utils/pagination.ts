export function paginate(skip: number) {
  const providerReturnSize = 8; // Currently provider return only 8 items per page.
  const takePagesAmount = 5; // We take 5 pages, it will return 40 items per page. (5 x 8)

  // Calculating end page index.
  const toPage = Math.ceil(
    ((skip + providerReturnSize * takePagesAmount) /
      (providerReturnSize * takePagesAmount)) *
      takePagesAmount,
  );

  // Calculating start page index, based in end page index.
  const fromPage = Math.ceil(Math.max(toPage - takePagesAmount, 0));

  return { fromPage, toPage };
}
