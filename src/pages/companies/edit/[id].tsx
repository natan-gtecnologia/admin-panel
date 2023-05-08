import BreadCrumb from '@growth/growforce-admin-ui/components/Common/BreadCrumb';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';

import { ICompany } from '../../../@types/company';
import { NextPageWithLayout } from '../../../@types/next';
import { CreateOrUpdateCompany } from '../../../components/Companies/CreateOrUpdateCompany';
import Layout from '../../../containers/Layout';
import { setupAPIClient } from '../../../services/api';
import { api } from '../../../services/apiClient';
import { convert_company_strapi } from '../../../utils/convertions/convert_company';
import { withSSRAuth } from '../../../utils/withSSRAuth';

type EditProps = {
  company: ICompany;
};

const Edit: NextPageWithLayout<EditProps> = ({ company: initialCompany }) => {
  const { data: company, isFetching } = useQuery(
    ['companies', initialCompany.id],
    async () => {
      const { data } = await api.get(`/companies/${initialCompany.id}`, {
        params: {
          populate: '*',
        },
      });

      return convert_company_strapi(data.data);
    },
    {
      initialData: initialCompany,
      refetchOnWindowFocus: false,
    },
  );

  return (
    <div className="page-content">
      <Head>
        <title>Editar empresa - Dashboard</title>
      </Head>
      <BreadCrumb title="Edição de empresa" pageTitle="Ecommerce" />
      {!isFetching && (
        <CreateOrUpdateCompany
          company={{
            ...company,
            company: company?.company?.id ?? null,
            priceList: company.priceList?.id ?? null,
            address: {
              address1: company.address?.address1 ?? '',
              address2: company.address?.address2 ?? '',
              city: company.address?.city ?? '',
              state: company.address?.state ?? '',
              postCode: company.address?.postCode ?? '',
              country: company.address?.country ?? 'BR',
              neighborhood: company.address?.neighborhood ?? '',
              number: company.address?.number ?? '',
            },
          }}
        />
      )}
    </div>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  try {
    const id = ctx.params?.id as string;
    const apiClient = setupAPIClient(ctx);

    if (!id) throw new Error("Id doesn't exist");

    const { data } = await apiClient.get(`/companies/${id}`, {
      params: {
        populate: '*',
      },
    });

    return {
      props: {
        company: convert_company_strapi(data.data),
      },
    };
  } catch {
    return {
      redirect: {
        destination: '/companies',
        permanent: false,
      },
    };
  }
});

export default Edit;

Edit.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
