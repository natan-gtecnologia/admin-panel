import BreadCrumb from '@growth/growforce-admin-ui/components/Common/BreadCrumb';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { NextPageWithLayout } from '../../@types/next';
import { CreateOrUpdateCoupon } from '../../components/Coupons/CreateOrUpdateCoupon';
import Layout from '../../containers/Layout';

type Props = {
  type: string;
};

const CreateCoupon: NextPageWithLayout<Props> = ({ type }) => {
  return (
    <div className="page-content">
      <Head>
        <title>Criar cupom - GrowForce</title>
      </Head>

      <BreadCrumb title="Criar cupom" pageTitle="Ecommerce" />

      <CreateOrUpdateCoupon type={type} />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const type = ctx.query.type;

  return {
    props: {
      type: type || 'product-quantity',
    },
  };
};

export default CreateCoupon;

CreateCoupon.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
