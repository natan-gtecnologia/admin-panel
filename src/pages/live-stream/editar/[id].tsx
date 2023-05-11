import { ILiveStream } from "@/@types/livestream";
import { NextPageWithLayout } from "@/@types/next";
import BreadCrumb from "@/components/Common/BreadCrumb";
import { CreateOrUpdate } from "@/components/LiveStream/CreateOrUpdate";
import Layout from "@/containers/Layout";
import { setupAPIClient } from "@/services/api";
import { convert_livestream_strapi } from "@/utils/convertions/convert_live_stream";
import { withSSRAuth } from "@/utils/withSSRAuth";
import Head from "next/head";
import { z } from "zod";

interface Props {
  livestream: ILiveStream;
}

const Page: NextPageWithLayout<Props> = () => {
  return (
    <div className="page-content">
      <Head>
        <title>Editar Live - Dashboard Liveforce</title>
      </Head>

      <BreadCrumb title="Nova Live" pageTitle="Lives" />

      <CreateOrUpdate />
    </div>
  );
};

const paramsSchema = z.object({
  id: z.string(),
});

export const getServerSideProps = withSSRAuth<Props>(async (ctx) => {
  try {
    const { id } = paramsSchema.parse(ctx.params);

    const response = await setupAPIClient(ctx).get(`/live-streams/${id}`);

    return {
      props: {
        livestream: convert_livestream_strapi(response.data.data),
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: "/live-stream",
        permanent: false,
      },
    };
  }
});

export default Page;

Page.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
