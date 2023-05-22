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

const Page: NextPageWithLayout<Props> = ({ livestream }) => {
  return (
    <div className="page-content">
      <Head>
        <title>Editar Live - Dashboard Liveforce</title>
      </Head>

      <BreadCrumb title="Nova Live" pageTitle="Lives" />

      <CreateOrUpdate
        data={{
          id: livestream.id,
          title: livestream.title,
          aiTags: [],
          products: livestream.streamProducts.map((product) => ({
            id: product.product.id,
            livePrice: product.price?.salePrice || product.price.regularPrice,
            highlighted: product.highlight,
          })),
          coupons: livestream.coupons.map((coupon) => coupon.id),
          broadcasters: livestream.broadcasters
            .map((broadcaster) => broadcaster.id)
            .filter((broadcaster) => broadcaster) as number[],
          initialLiveText: livestream.startText,
          afterLiveTime: Number(livestream?.timeout || 0),
          chatReleased: livestream.chat.active ?? false,
          liveColor: livestream.backgroundColorIfNotHaveBanner,
          scheduledStartTime: new Date(livestream.schedule),
          shortDescription: livestream.liveDescription,
          bannerId: livestream.bannerLive?.id || null,
          chatId: livestream.chat.id,
        }}
        broadcasters={
          livestream.broadcasters
            .map((broadcaster) => ({
              broadcaster_id: broadcaster.broadcaster_id,
              id: broadcaster.id,
            }))
            .filter((broadcaster) => broadcaster.id) as {
              broadcaster_id: number;
              id: number;
            }[]
        }
      />
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
    console.log(error);
    return {
      notFound: true,
    };
    //return {
    //  redirect: {
    //    destination: "/live-stream",
    //    permanent: false,
    //  },
    //};
  }
});

export default Page;

Page.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
