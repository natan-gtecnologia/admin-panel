export interface ICustomers {
  id: number;
  email: string;
  document: string;
  birthDate: string;
  documentType: 'cpf' | 'cnpj' | 'passport';
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  mobilePhone: {
    number: string;
  },
  address: {
    id: number;
    address1: string;
    address2: string;
    number: string;
    postCode: string;
    city: string;
    state: string;
    country: string;
    neighborhood: string;
  }
  orders: {
    id: number;
    attributes: {
      createdAt?: string;
      orderId?: string;
      status?: string;
      updatedAt?: string;
      uuid?: string;
    }
  }[],
  carts: {
    attributes: {
      createdAt?: string;
      hash: string;
      shippingMethod?: string;
      updatedAt?: string;
    };
    id: number;
  }[]
}
