import BreadCrumb from '@growth/growforce-admin-ui/components/Common/BreadCrumb';
import Head from 'next/head';
import { NextPageWithLayout } from '../../@types/next';
import { CreateOrEditCustomers } from '../../components/Custumers/CreateOrEditCustomers';
import Layout from '../../containers/Layout';
import { withSSRAuth } from '../../utils/withSSRAuth';

const Create: NextPageWithLayout = () => {
  return (
    <div className="page-content">
      <Head>
        <title>Adicionar novo cliente - GrowForce</title>
      </Head>
      <BreadCrumb title="Novo cliente" pageTitle="Ecommerce" />
      <CreateOrEditCustomers />
    </div>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  return {
    props: {},
  };
});

export default Create;

Create.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
