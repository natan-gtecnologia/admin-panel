import BreadCrumb from '@growth/growforce-admin-ui/components/Common/BreadCrumb';
import { useQuery } from '@tanstack/react-query';
import { CreateOrEditBanners } from 'apps/growforce/admin-panel/components/BannersCollection/CreateOrEditBanners';
import Head from 'next/head';

import { NextPageWithLayout } from '../../../@types/next';
import { IStrapiBanner } from '../../../@types/strapi';
import Layout from '../../../containers/Layout';
import { setupAPIClient } from '../../../services/api';
import { api } from '../../../services/apiClient';
import { convert_banner_strapi } from '../../../utils/convertions/convert_banner';
import { withSSRAuth } from '../../../utils/withSSRAuth';

type EditProps = {
  banner: IStrapiBanner;
};

const Edit: NextPageWithLayout<EditProps> = ({ banner: initialBanner }) => {

  const { data: banner, isFetching } = useQuery(
    ['banner-collections', initialBanner.id],
    async () => {
      const { data } = await api.get(`/banner-collections/${initialBanner.id}?populate%5Bbanner%5D%5Bpopulate%5D%5Bbanner%5D%5Bpopulate%5D=*`);

      return data.data
    },
    {
      initialData: convert_banner_strapi(initialBanner),
      refetchOnWindowFocus: false,
    }
  );

  return (
    <div className="page-content">
      <Head>
        <title>Editar Banner - Dashboard</title>
      </Head>
      <BreadCrumb title="Edição do banner" pageTitle="Ecommerce" />
      {!isFetching && <CreateOrEditBanners banner={banner} />}
    </div>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  try {
    const id = ctx.params?.id as string;
    const apiClient = setupAPIClient(ctx);

    if (!id) throw new Error("Id doesn't exist");

    const { data } = await apiClient.get(`banner-collections/${id}?populate%5Bbanner%5D%5Bpopulate%5D%5Bbanner%5D%5Bpopulate%5D=*`);

    return {
      props: {
        banner: data.data,
      },
    };
  } catch {
    return {
      redirect: {
        destination: '/colecao-banners',
        permanent: false,
      },
    };
  }
});

export default Edit;

Edit.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
