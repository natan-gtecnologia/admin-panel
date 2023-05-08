import BreadCrumb from '@growth/growforce-admin-ui/components/Common/BreadCrumb';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';

import { NextPageWithLayout } from '../../../@types/next';
import { IStrapiTag } from '../../../@types/strapi';
import { CreateOrEditTags } from '../../../components/Tags/CreateOrEditTags';
import Layout from '../../../containers/Layout';
import { setupAPIClient } from '../../../services/api';
import { api } from '../../../services/apiClient';
import { convert_tag_strapi } from '../../../utils/convertions/convert_tag';
import { withSSRAuth } from '../../../utils/withSSRAuth';

type EditProps = {
  tag: IStrapiTag;
};

const Edit: NextPageWithLayout<EditProps> = ({ tag: initialTag }) => {
  const { data: tag, isFetching } = useQuery(
    ['tags', initialTag.id],
    async () => {
      const { data } = await api.get(`/tags/${initialTag.id}`, {
        params: {
          populate: '*',
        },
      });

      return convert_tag_strapi(data.data);
    },
    {
      initialData: convert_tag_strapi(initialTag),
      refetchOnWindowFocus: false,
    }
  );

  return (
    <div className="page-content">
      <Head>
        <title>Editar tag - Dashboard</title>
      </Head>
      <BreadCrumb title="Edição de tag" pageTitle="Ecommerce" />
      {!isFetching && <CreateOrEditTags tag={tag} />}
    </div>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  try {
    const id = ctx.params?.id as string;
    const apiClient = setupAPIClient(ctx);

    if (!id) throw new Error("Id doesn't exist");

    const { data } = await apiClient.get(`/tags/${id}`, {
      params: {
        populate: '*',
      },
    });

    return {
      props: {
        tag: data.data,
      },
    };
  } catch {
    return {
      redirect: {
        destination: '/tags',
        permanent: false,
      },
    };
  }
});

export default Edit;

Edit.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
