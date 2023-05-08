import { IPriceList } from './priceList';
import { MetaData } from './strapi';

export interface ICompany {
  id: number;
  name: string;
  cnpj: string;
  phone?: string;
  email: string;
  nodeId: string;
  address?: {
    address1: string;
    address2?: string;
    number: string;
    city: string;
    state: string;
    postCode: string;
    neighborhood?: string;
    country: string;
  };

  company?: ICompany;
  priceList: IPriceList;

  createdAt: string;
  updatedAt: string;
  metaData: MetaData[],
}
