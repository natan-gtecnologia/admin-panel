import { NextPageWithLayout } from "@/@types/next";
import BreadCrumb from "@/components/Common/BreadCrumb";
import Layout from "@/containers/Layout";
import { withSSRAuth } from "@/utils/withSSRAuth";
import Head from "next/head";

interface Props {}

const Page: NextPageWithLayout<Props> = () => {
  return (
    <div className="page-content">
      <Head>
        <title>Gerenciamento da Live - Dashboard</title>
      </Head>

      <BreadCrumb title="Nova Live" pageTitle="Ecommerce" />
    </div>
  );
};

export const getServerSideProps = withSSRAuth<Props>(async (ctx) => {
  return {
    props: {},
  };
});

export default Page;

Page.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
