import qs from 'qs';

import BreadCrumb from '@growth/growforce-admin-ui/components/Common/BreadCrumb';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';
import { NextPageWithLayout } from '../../@types/next';
import { IOrder } from '../../@types/order';
import { IStrapiOrder } from '../../@types/strapi';
import { OrderDetails } from '../../components/Orders';
import Layout from '../../containers/Layout';
import { setupAPIClient } from '../../services/api';
import { api } from '../../services/apiClient';
import { convert_order_strapi } from '../../utils/convertions/convert_order';
import { withSSRAuth } from '../../utils/withSSRAuth';

type DetailsProps = {
  order: IOrder;
};

const Details: NextPageWithLayout<DetailsProps> = ({ order: initialData }) => {
  const { data: order, isFetching } = useQuery(
    ['order', initialData.id],
    async () => {
      const order = await api.get(`/orders/${initialData.id}`, {
        params: {
          populate: [
            'billingAddress',
            'shippingAddress',
            'items',
            'items.price',
            'items.product',
            'items.product.images',
            'items.product.price',
            'items.metaData',
            'totals',
            'customer',
            'customer.mobilePhone',
            'customer.homePhone',
            'payment',
            'metaData',
            'shipping',
            'coupons',
          ],
        },
        paramsSerializer: (params) => {
          return qs.stringify(params);
        },
      });

      return convert_order_strapi(order.data.data);
    },
    {
      initialData,
      refetchOnWindowFocus: false,
    }
  );

  return (
    <div className="page-content">
      <Head>
        <title>Pedido {order.orderId} - GrowForce</title>
      </Head>
      <BreadCrumb title="Detalhes do pedido" pageTitle="Ecommerce" />
      {!isFetching && (
        <OrderDetails order={order} />
      )}
    </div>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  try {
    const apiClient = setupAPIClient(ctx);
    const { detailsId: orderId } = ctx.params;

    if (!orderId) throw new Error("Order id doesn't exist");

    const orders = await apiClient.get<{
      data: IStrapiOrder;
    }>(`/orders/${orderId}`, {
      params: {
        populate: {
          billingAddress: {
            populate: '*'
          },
          shippingAddress: {
            populate: '*'
          },
          items: {
            populate: '*'
          },
          totals: {
            populate: '*'
          },
          customer: {
            populate: '*'
          },
          metaData: {
            populate: '*'
          },
          payment: {
            populate: '*'
          },
          coupons: {
            populate: '*'
          },
          shipping: {
            populate: '*'
          },
        },
      },
      paramsSerializer: (params) => {
        return qs.stringify(params);
      },
    });

    return {
      props: {
        order: convert_order_strapi(orders.data.data),
      },
    };
  } catch {
    return {
      props: {},
      notFound: true,
    };
  }
});

export default Details;

Details.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
