import { api } from '../services/apiClient';

export async function getAddress(cep: string) {
  const addressResponse = await api.get<{
    bairro: string;
    cep: string;
    complemento: string;
    ddd: string;
    gia: string;
    ibge: string;
    localidade: string;
    logradouro: string;
    siafi: string;
    uf: string;
  }>(`/util/address/${cep}`);
  return {
    address: addressResponse.data,
  };
}
