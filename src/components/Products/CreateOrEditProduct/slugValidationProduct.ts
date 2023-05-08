import QueryString from 'qs';
import { api } from '../../../services/apiClient';

export async function validateProductSlug(
  slug: string,
  productId: number | null,
) {
  const response = await api.get<{
    valid: boolean;
  }>(`/util/validate-slug`, {
    params: {
      model: 'product',
      field: 'slug',
      item: {
        ...(productId && { id: productId }),
        content: slug,
      },
    },
    paramsSerializer: (params) => {
      return QueryString.stringify(params);
    },
  });

  return response.data.valid;
}
