import { NextPageContext } from 'next';
import QueryString from 'qs';
import { IStrapiCompany } from '../../@types/strapi';
import { setupAPIClient } from '../../services/api';
import { convert_company_strapi } from '../../utils/convertions/convert_company';

/**
 * It fetches a list of companies from the Strapi API, and converts them to a format
 * that's easier to work with in the frontend
 * @param params - Record<string, any> - The parameters to be passed to the API
 */
export async function getCompanies(
  ctx: Pick<NextPageContext, 'req'>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any>,
) {
  const apiClient = setupAPIClient(ctx);
  const companies = await apiClient.get<{
    meta: {
      pagination: {
        total: number;
        pageCount: number;
      };
    };
    data: IStrapiCompany[];
  }>('/companies', {
    params: {
      populate: '*',
      pagination: {
        pageSize: 10,
        ...params.pagination,
      },
      publicationState: 'preview',
      ...params,
    },
    paramsSerializer: (params) => {
      return QueryString.stringify(params);
    },
  });

  return {
    companies: companies.data.data.map(convert_company_strapi),
    totalPages: companies.data.meta.pagination.pageCount,
  };
}
