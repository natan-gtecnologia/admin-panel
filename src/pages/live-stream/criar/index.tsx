import { NextPageWithLayout } from "@/@types/next";
import BreadCrumb from "@/components/Common/BreadCrumb";
import { CreateOrUpdate } from "@/components/LiveStream/CreateOrUpdate";
import Layout from "@/containers/Layout";
import { withSSRAuth } from "@/utils/withSSRAuth";
import Head from "next/head";

interface Props {}

const Page: NextPageWithLayout<Props> = () => {
  return (
    <div className="page-content">
      <Head>
        <title>Criar Live - Dashboard</title>
      </Head>

      <BreadCrumb title="Nova Live" pageTitle="Lives" />

      <CreateOrUpdate />
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
