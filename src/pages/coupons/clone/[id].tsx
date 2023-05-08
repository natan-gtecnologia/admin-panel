import BreadCrumb from '@growth/growforce-admin-ui/components/Common/BreadCrumb';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';

import { ICoupon } from '../../../@types/coupon';
import { NextPageWithLayout } from '../../../@types/next';
import { CreateOrUpdateCoupon } from '../../../components/Coupons/CreateOrUpdateCoupon';
import Layout from '../../../containers/Layout';
import { setupAPIClient } from '../../../services/api';
import { api } from '../../../services/apiClient';
import { convert_coupon_strapi } from '../../../utils/convertions/convert_coupon';
import { withSSRAuth } from '../../../utils/withSSRAuth';

type EditProps = {
  coupon: ICoupon;
  type: string;
};

const Edit: NextPageWithLayout<EditProps> = ({
  coupon: initialCoupon,
  type,
}) => {
  const { data: coupon } = useQuery(
    ['coupons', initialCoupon.id],
    async () => {
      const { data } = await api.get(`/coupons/${initialCoupon.id}`, {
        params: {
          populate: '*',
        },
      });

      const coupon = convert_coupon_strapi(data.data);
      delete coupon.id
      return coupon;
    },
    {
      initialData: {
        ...initialCoupon,
        id: undefined
      },
      refetchOnWindowFocus: false,
    }
  );

  return (
    <div className="page-content">
      <Head>
        <title>Clonar cupom - Admin</title>
      </Head>
      <BreadCrumb title="Clonar coupon" pageTitle="Ecommerce" />
      <CreateOrUpdateCoupon
        coupon={{
          ...coupon,
          buyAndEarnProducts: coupon.buyAndEarnProducts.map((product) => ({
            buyProducts: {
              product: product.buyProducts.product.data.id,
              quantity: product.buyProducts.quantity,
            },
            earnProducts: {
              product: product.earnProducts.product.data.id,
              quantity: product.earnProducts.quantity,
            },
          })),
          method: coupon.automatic ? 'auto' : 'code',
          shippingDiscount: coupon.shippingDiscount || 0,
          initialDate: coupon.initialDate,
          enabled: coupon.enabled,
        }}
        type={type}
      />
    </div>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  try {
    const id = ctx.params?.id as string;
    const apiClient = setupAPIClient(ctx);

    if (!id) throw new Error("Id doesn't exist");

    const { data } = await apiClient.get(`/coupons/${id}`, {
      params: {
        populate: '*',
      },
    });

    const coupon = convert_coupon_strapi(data.data);
    let coupon_type = '';

    if (
      ['free_shipping', 'to_shipping'].includes(coupon.shippingType) ||
      ['free_shipping_by_region', 'free_shipping_by_products'].includes(
        coupon.type
      )
    ) {
      coupon_type = 'free_shipping';
    }

    if (
      coupon.buyAndEarnProducts.length > 0 ||
      coupon.type === 'buy_and_earn_by_products'
    ) {
      coupon_type = 'buy_and_earn';
    }

    if (
      (coupon.type === 'specific_products' ||
        coupon.type === 'all_store' ||
        coupon.type === 'specific_customers') &&
      coupon.shippingType === 'not_apply'
    ) {
      coupon_type = 'product-quantity';
    }

    return {
      props: {
        coupon,
        type: coupon_type,
      },
    };
  } catch {
    return {
      redirect: {
        destination: '/coupons',
        permanent: false,
      },
    };
  }
});

export default Edit;

Edit.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
