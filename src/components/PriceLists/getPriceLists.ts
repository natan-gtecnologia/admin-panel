import { NextPageContext } from 'next';
import { IStrapiPriceList } from '../../@types/strapi';
import { setupAPIClient } from '../../services/api';
import { convert_price_list_strapi } from '../../utils/convertions/convert_price_list';

/**
 * It fetches a list of companies from the Strapi API, and converts them to a format
 * that's easier to work with in the frontend
 * @param params - Record<string, any> - The parameters to be passed to the API
 */
export async function getPriceLists(
  ctx: Pick<NextPageContext, 'req'>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any>,
) {
  const apiClient = setupAPIClient(ctx);
  const priceLists = await apiClient.get<{
    meta: {
      pagination: {
        total: number;
        pageCount: number;
      };
    };
    data: IStrapiPriceList[];
  }>('/price-lists', {});

  return {
    priceLists: priceLists.data.data.map(convert_price_list_strapi),
    totalPages: priceLists.data.meta.pagination?.pageCount ?? 1,
  };
}
