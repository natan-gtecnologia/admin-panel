import { IStrapiImage, IStrapiProduct, MetaData } from './strapi';

export interface IProduct {
  id: number;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  type: 'simple' | 'grouped' | 'kit';
  status: 'available' | 'not_available';
  productType: 'physical' | 'digital';
  featured: boolean;
  sku: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;

  currency: {
    id: number;
    code: string;
    symbol: string;
    decimals: number;
  };
  price: {
    id: number;
    regularPrice: number;
    salePrice: number;
    offPrice: number;
  };
  dimension: {
    id: number;
    width: number;
    height: number;
    weight: number;
    length: number;
  };
  images: {
    data: IStrapiImage[];
  };
  categories: {
    data: {
      id: number;
      attributes: {
        title: string;
        description: string;
      };
    }[];
  };
  tags: {
    data: {
      id: number;
      attributes: {
        tag: string;
        color: string;
      };
    }[];
  };
  metaData?: MetaData[];
  features: {
    id: number;
    label: string;
    value: string;
  }[];
  groupType: 'simple' | 'grouped' | 'kit';
  brand: {
    data?: {
      id: number;
      attributes: {
        name: string;
        createdAt: string;
        updatedAt: string;
      };
    };
  };
  company?: {
    data?: {
      attributes: {
        name: string;
      };
    };
  };
  distribution_centers?: {
    data?: {
      id: number;
      attributes: {
        name: string;
      };
    }[];
  };
  stockStatus: 'in_stock' | 'out_of_stock' | 'on_back_order';
  stockQuantity: number;
  totalSales: number;

  groupedProducts: {
    quantity: number;
    product: {
      data: IStrapiProduct;
    };
  }[];
  relationed_products: {
    data: IStrapiProduct[];
  };
}
