export interface IPriceList {
  id: number;
  name: string;
  productPrices: {
    product: {
      id: number;
      title: string;
    };
    price: {
      regularPrice: number;
      salePrice: number;
    };
  }[];
  enabled: boolean;
  company: number | null;

  createdAt: string;
  updatedAt: string;
}
