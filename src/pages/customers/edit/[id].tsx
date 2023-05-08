import BreadCrumb from '@growth/growforce-admin-ui/components/Common/BreadCrumb';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';

import { NextPageWithLayout } from '../../../@types/next';
import { IStrapiCustomer } from '../../../@types/strapi';
import { CreateOrEditCustomers } from '../../../components/Custumers/CreateOrEditCustomers';
import Layout from '../../../containers/Layout';
import { setupAPIClient } from '../../../services/api';
import { api } from '../../../services/apiClient';
import { convert_customer_strapi } from '../../../utils/convertions/convert_customer';
import { withSSRAuth } from '../../../utils/withSSRAuth';

type EditProps = {
  customer: IStrapiCustomer;
};

const Edit: NextPageWithLayout<EditProps> = ({
  customer: initialCustomers,
}) => {
  const { data: customers } = useQuery(
    ['customer', initialCustomers.id],
    async () => {
      const { data } = await api.get(`/customers/${initialCustomers.id}`, {
        params: {
          populate: '*',
        },
      });

      return convert_customer_strapi(data.data);
    },
    {
      initialData: convert_customer_strapi(initialCustomers),
      refetchOnWindowFocus: false,
    },
  );

  return (
    <div className="page-content">
      <Head>
        <title>Editar cliente - GrowForce</title>
      </Head>
      <BreadCrumb title="Edição de cliente" pageTitle="Ecommerce" />
      <CreateOrEditCustomers
        customers={{
          ...customers,
          birthDate: customers.birthDate ? new Date(customers.birthDate) : null,
          orders: customers.orders.map((order) => order.id),
          carts: customers?.carts.map((order) => order.id),
        }}
      />
    </div>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  try {
    const id = ctx.params?.id as string;
    const apiClient = setupAPIClient(ctx);

    if (!id) throw new Error("Id doesn't exist");

    const { data } = await apiClient.get(`/customers/${id}`, {
      params: {
        populate: '*',
      },
    });

    return {
      props: {
        customer: data.data,
      },
    };
  } catch {
    return {
      redirect: {
        destination: '/customers',
        permanent: false,
      },
    };
  }
});

export default Edit;

Edit.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
