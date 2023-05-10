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
  const percentage = (price / regularPrice) * 100;
  return Math.round(percentage);
};