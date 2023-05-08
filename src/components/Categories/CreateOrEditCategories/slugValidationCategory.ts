import QueryString from 'qs';
import { api } from '../../../services/apiClient';

export async function validateSlug(slug: string, categoryId: number | null) {
  const response = await api.get<{ valid: boolean }>('/util/validate-slug', {
    params: {
      model: 'category',
      field: 'slug',
      item: {
        ...(categoryId && { id: categoryId }),
        content: slug,
      },
    },
    paramsSerializer: (params) => {
      return QueryString.stringify(params);
    },
  });

  return response.data.valid;
}
