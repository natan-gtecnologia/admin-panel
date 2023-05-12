export function currentPrice(product: {
  price: number;
  regular_price: number;
}): {
  price: number;
  discount: boolean;
} {
  const hasDiscount =
    product.price > 0 &&
    product.price !== product.regular_price &&
    product.price < product.regular_price;
  const currentPrice = hasDiscount ? product.price : product.regular_price;

  return {
    price: currentPrice,
    discount: hasDiscount,
  };
}

export const discountPercentage = (regularPrice: number, price: number) => {
  if (regularPrice === price || regularPrice === 0 || price > regularPrice)
    return 0;

  const percentage = ((regularPrice - price) / regularPrice) * 100;
  return percentage.toFixed(2);
};
