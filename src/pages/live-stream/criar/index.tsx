import { NextPageWithLayout } from "@/@types/next";
import Layout from "@/containers/Layout";
import { withSSRAuth } from "@/utils/withSSRAuth";

interface Props {}

const Page: NextPageWithLayout<Props> = () => {
  return <h1>hello world</h1>;
};

export const getServerSideProps = withSSRAuth<Props>(async (ctx) => {
  return {
    props: {},
  };
});

export default Page;

Page.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
