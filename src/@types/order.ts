import { IStrapiImage, MetaData } from './strapi';
export interface IOrder {
  id: number;
  orderId: string;
  createdAt: string;
  items: [
    {
      id: number;
      quantity: number;
      gift: false;
      name: string;
      sku: string;
      product: {
        data: {
          id: number;
          attributes: {
            images?: {
              data: IStrapiImage[];
            };
            price?: {
              regularPrice: number;
              salePrice: number;
              offPrice?: number;
            };
          };
        };
      };
      price: {
        regularPrice: number;
        salePrice: number;
        offPrice?: number;
      };
      metaData: MetaData[];
    }
  ];
  totals: {
    id: number;
    quantity: number;
    subTotal: number;
    fee: number;
    discount: number;
    shipping: number;
    total: number;
    shippingDiscount: number;
  };
  customer: {
    id: number;
    email: string;
    document: string;
    documentType: string;
    createdAt: string;
    updatedAt: string;
    firstName: string;
    lastName: string;
    homePhone: {
      countryCode: string;
      areaCode: string;
      number: string;
    };
    mobilePhone: {
      countryCode: string;
      areaCode: string;
      number: string;
    };
  };
  payment: {
    id: number;
    method: 'pix' | 'credit_card' | 'boleto';
    qrCode: string;
    code: string;
    installments: number;
  };
  status:
  | 'PENDING'
  | 'PAID'
  | 'SHIPPING'
  | 'SHIPPING_LAST_STEP'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELED'
  | 'REFUNDED';
  billingAddress: {
    id: number;
    address1: string;
    address2: string;
    number: string;
    postCode: string;
    city: string;
    state: string;
    country: string;
    neighborhood: string;
  };
  shippingAddress: {
    id: number;
    address1: string;
    address2: string;
    number: string;
    postCode: string;
    city: string;
    state: string;
    country: string;
    neighborhood: string;
  };
  coupons: {
    id: number;
    description: string;
    discount: number;
    type:
    | 'all_store'
    | 'specific_products'
    | 'specific_categories'
    | 'specific_customers'
    | 'free_shipping_by_region'
    | 'free_shipping_by_products'
    | 'buy_and_earn_by_products'
    | 'buy_and_earn_by_categories'
    | 'buy_and_earn_by_cart_price';
    discountType: 'price' | 'percentage';
    shippingType: 'not_apply' | 'to_shipping' | 'free_shipping';
    code: string;
  }[];
  shipping: {
    id: number;
    method: string;
    trackingCode: string;
    trackingEvents: {
      uf?: string;
      tag: 'added' | 'collected' | 'movement' | 'onroute' | 'delivered';
      city?: string;
      date: '2022-11-17T03:05:52.000Z';
      local?: string;
      events: string;
      comment?: string;
      latitude?: string;
      longitude?: string;
      signature?: string;
      created_at: string;
      postal_code?: string;
      tracking_id: number;
      delivered_at: string;
      destination_uf?: string;
      destination_city?: string;
      destination_local?: string;
      sk_event: string;
    }[];
  };

  paymentId: string;
  comission: string | number;
  erpNumber: string;
  erpOrderId: string;
}
