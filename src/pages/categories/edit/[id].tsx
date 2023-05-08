import BreadCrumb from '@growth/growforce-admin-ui/components/Common/BreadCrumb';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';

import { NextPageWithLayout } from '../../../@types/next';
import { IStrapiCategory } from '../../../@types/strapi';
import { CreateOrEditCategories } from '../../../components/Categories/CreateOrEditCategories';
import Layout from '../../../containers/Layout';
import { setupAPIClient } from '../../../services/api';
import { api } from '../../../services/apiClient';
import { convert_category_strapi } from '../../../utils/convertions/convert_category';
import { withSSRAuth } from '../../../utils/withSSRAuth';

type EditProps = {
  category: IStrapiCategory;
};

const Edit: NextPageWithLayout<EditProps> = ({ category: initialCategory }) => {
  const { data: category } = useQuery(
    ['category', initialCategory.id],
    async () => {
      const { data } = await api.get(`/categories/${initialCategory.id}`, {
        params: {
          publicationState: 'preview',
          populate: '*',
        },
      });

      return convert_category_strapi(data.data);
    },
    {
      initialData: convert_category_strapi(initialCategory),
      refetchOnWindowFocus: false,
    },
  );

  return (
    <div className="page-content">
      <Head>
        <title>Editar categoria - GrowForce</title>
      </Head>
      <BreadCrumb title="Edição de Categoria" pageTitle="Ecommerce" />
      <CreateOrEditCategories key={category?.id} category={category} />
    </div>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  try {
    const id = ctx.params?.id as string;
    const apiClient = setupAPIClient(ctx);

    if (!id) throw new Error("Id doesn't exist");

    const { data } = await apiClient.get(`/categories/${id}`, {
      params: {
        publicationState: 'preview',
        populate: '*',
      },
    });

    return {
      props: {
        category: data.data,
      },
    };
  } catch {
    return {
      redirect: {
        destination: '/categories',
        permanent: false,
      },
    };
  }
});

export default Edit;

Edit.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
