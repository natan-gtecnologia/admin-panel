import BreadCrumb from '@growth/growforce-admin-ui/components/Common/BreadCrumb';
import Head from 'next/head';
import { NextPageWithLayout } from '../../@types/next';
import CreateOrEditProduct from '../../components/Products/CreateOrEditProduct';
import Layout from '../../containers/Layout';
import { withSSRAuth } from '../../utils/withSSRAuth';

const Create: NextPageWithLayout = () => {
  return (
    <div className="page-content">
      <Head>
        <title>Criar Produto - GrowForce</title>
      </Head>
      <BreadCrumb title="Criação de produto" pageTitle="Ecommerce" />
      <CreateOrEditProduct />
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
