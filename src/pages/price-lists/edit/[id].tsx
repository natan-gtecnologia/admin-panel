import BreadCrumb from '@growth/growforce-admin-ui/components/Common/BreadCrumb';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';

import { currencyMask } from 'apps/growforce/admin-panel/utils/masks';
import { NextPageWithLayout } from '../../../@types/next';
import { IPriceList } from '../../../@types/priceList';
import { CreateOrUpdatePriceList } from '../../../components/PriceLists/CreateOrUpdatePriceList';
import Layout from '../../../containers/Layout';
import { setupAPIClient } from '../../../services/api';
import { api } from '../../../services/apiClient';
import { convert_price_list_strapi } from '../../../utils/convertions/convert_price_list';
import { withSSRAuth } from '../../../utils/withSSRAuth';

type EditProps = {
  priceList: IPriceList;
};

const Edit: NextPageWithLayout<EditProps> = ({
  priceList: initialPriceList,
}) => {
  const { data: priceList, isFetching } = useQuery(
    ['price-lists', initialPriceList.id],
    async () => {
      const { data } = await api.get(`/price-lists/${initialPriceList.id}`, {
        params: {
          populate: '*',
        },
      });

      return convert_price_list_strapi(data.data);
    },
    {
      initialData: initialPriceList,
      refetchOnWindowFocus: false,
    },
  );

  return (
    <div className="page-content">
      <Head>
        <title>Editar lista de preço - Dashboard</title>
      </Head>
      <BreadCrumb title="Edição de empresa" pageTitle="Ecommerce" />
      {!isFetching && (
        <CreateOrUpdatePriceList
          priceList={{
            ...priceList,
            productPrices: priceList.productPrices.map((productPrice) => ({
              product: productPrice.product.id,
              title: productPrice.product.title,
              price: {
                regularPrice: currencyMask.maskDefault(
                  productPrice.price.regularPrice,
                ),
                salePrice: currencyMask.maskDefault(
                  productPrice.price.salePrice,
                ),
              },
            })),
          }}
        />
      )}
    </div>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  try {
    const id = ctx.params?.id as string;
    const apiClient = setupAPIClient(ctx);

    if (!id) throw new Error("Id doesn't exist");

    const { data } = await apiClient.get(`/price-lists/${id}`, {
      params: {
        populate: '*',
      },
    });

    return {
      props: {
        priceList: convert_price_list_strapi(data.data),
      },
    };
  } catch {
    return {
      redirect: {
        destination: '/price-lists',
        permanent: false,
      },
    };
  }
});

export default Edit;

Edit.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
