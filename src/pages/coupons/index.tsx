/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/link-passhref */
import BreadCrumb from '@growth/growforce-admin-ui/components/Common/BreadCrumb';
import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import Loader from '@growth/growforce-admin-ui/components/Common/Loader';
import clsx from 'clsx';
import { NextPageContext } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import QueryString from 'qs';
import { useCallback, useState } from 'react';
import { Button } from 'reactstrap';
import { ICoupon } from '../../@types/coupon';
import { NextPageWithLayout } from '../../@types/next';
import { IStrapiCoupon } from '../../@types/strapi';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { ListCoupons } from '../../components/Coupons/ListCoupons';
import { NoCoupon } from '../../components/Coupons/NoCoupon';
import Layout from '../../containers/Layout';
import { setupAPIClient } from '../../services/api';
import { api } from '../../services/apiClient';
import { convert_coupon_strapi } from '../../utils/convertions/convert_coupon';
import { withSSRAuth } from '../../utils/withSSRAuth';

const CreateCouponModal = dynamic(
  async () =>
    (await import('../../components/Coupons/CreateCouponModal'))
      .CreateCouponModal,
);

type CouponsProps = {
  coupons: ICoupon[];
  totalPages: number;
};

async function getCoupons(
  ctx: Pick<NextPageContext, 'req'>,
  params: Record<string, any>,
) {
  const apiClient = setupAPIClient(ctx);

  const coupons = await apiClient.get<{
    meta: {
      total: number;
      pageCount: number;
    };
    data: IStrapiCoupon[];
  }>('/coupons', {
    params: {
      populate: '*',
      pagination: {
        pageSize: 10,
        ...params.pagination,
      },
      ...params,
    },
    paramsSerializer: (params) => {
      return QueryString.stringify(params);
    },
  });
  return {
    coupons: coupons.data.data.map(convert_coupon_strapi),
    totalPages: coupons.data.meta?.pageCount ?? 1,
  };
}
const Coupons: NextPageWithLayout<CouponsProps> = ({
  coupons: initialCoupons,
  totalPages: initialTotalPages,
}) => {
  const [modal, setModal] = useState(false);
  const hasCoupons = initialCoupons.length > 0;
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggle = () => setModal((oldState) => !oldState);

  const handleDeleteCoupons = useCallback(async () => {
    setIsDeleting(true);
    try {
      for (const id of selectedIds) {
        await api.delete(`/coupons/${id}`);
      }

      setSelectedIds([]);
    } catch (error) {
      //toast.error('Erro ao excluir pedido');
    } finally {
      setIsDeleting(false);
    }
  }, [selectedIds]);

  return (
    <div className="page-content">
      <Head>
        <title>Cupons - GrowForce</title>
      </Head>
      <BreadCrumb title="Cupom" pageTitle="Ecommerce" />

      <Card>
        <Card.Header className="d-flex align-items-center justify-content-between">
          <h5 className="mb-0">Cupons de desconto</h5>

          {hasCoupons && (
            <div className="d-flex align-items-center gap-2">
              <Button
                onClick={toggle}
                className="btn btn-success add-btn shadow-none"
              >
                <i className="ri-add-line align-bottom me-1"></i> Adicionar
                cupom
              </Button>
              <CreateCouponModal open={modal} onToggle={toggle} />

              {selectedIds.length > 0 && (
                <ConfirmationModal
                  changeStatus={handleDeleteCoupons}
                  title="Excluir tags"
                  message="Tem certeza que deseja excluir essas tags? Essa ação não pode ser desfeita."
                >
                  <button
                    type="button"
                    className="btn shadow-none btn-soft-danger bg"
                  >
                    <i className="ri-delete-bin-line align-bottom"></i>
                  </button>
                </ConfirmationModal>
              )}
            </div>
          )}
        </Card.Header>
        <Card.Body
          style={{
            minHeight: hasCoupons ? 1 : 600,
          }}
          className={clsx({
            'd-flex flex-column align-items-center justify-content-center':
              !hasCoupons,
          })}
        >
          {!hasCoupons && <NoCoupon />}

          {hasCoupons && !isDeleting && (
            <ListCoupons
              getCoupons={getCoupons}
              initialCoupons={initialCoupons}
              initialTotalPages={initialTotalPages}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
            />
          )}
        </Card.Body>
      </Card>
      {isDeleting && <Loader loading={null} />}
    </div>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const props = getCoupons(ctx, {});

  return {
    props,
  };
});

export default Coupons;

Coupons.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
