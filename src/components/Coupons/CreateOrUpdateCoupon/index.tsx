import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { Button, Col, Form, Row, Spinner } from 'reactstrap';
import { ICoupon } from '../../../@types/coupon';

import { api } from '../../../services/apiClient';
import { BuyAndEarn } from './BuyAndEarn';
import { ByQuantity } from './ByQuantity';
import { ByQuantityInProducts } from './ByQuantityInProducts';
import { FreeShipping } from './FreeShipping';
import { Resume } from './Resume';
import {
  CreateOrUpdateCouponSchemaProps,
  createOrUpdateSchema,
} from './schema';

type Props = {
  coupon?: CreateOrUpdateCouponSchemaProps & {
    id: number;
  };
  type: string;
};

function getType(type: string): ICoupon['type'] {
  switch (type) {
    case 'free_shipping':
      return 'all_store';
    case 'product-quantity':
      return 'specific_products';
    case 'buy_and_earn':
      return 'buy_and_earn_by_products';
    default:
      return 'all_store';
  }
}

export function CreateOrUpdateCoupon({ coupon, type }: Props) {
  const DEFAULT_COUPON: CreateOrUpdateCouponSchemaProps = {
    code: '',
    discount: 0,
    discountType: 'percentage',
    description: '',
    finalCepRange: '',
    initialCepRange: '',
    maximumUseQuantity: 0,
    minimumCartAmount: 0,
    minimumProductQuantity: 0,
    shippingDiscount: 0,
    shippingType: type === 'free_shipping' ? 'free_shipping' : 'not_apply',
    shippingDiscountType: 'price',
    enabled: coupon?.enabled,
    type: getType(type),
    method: 'code',
    useQuantityByCustomer: [],
  };
  const router = useRouter();
  const { formState, handleSubmit, ...form } =
    useForm<CreateOrUpdateCouponSchemaProps>({
      defaultValues: coupon || DEFAULT_COUPON,
      resolver: zodResolver(createOrUpdateSchema),
    });

  const { mutateAsync: handleCreateOrUpdateCoupon } = useMutation(
    async (data: CreateOrUpdateCouponSchemaProps) => {
      if (
        data.type === 'buy_and_earn_by_products' &&
        data.buyAndEarnProducts.length === 0
      ) {
        form.setError('buyAndEarnProducts', {
          type: 'manual',
          message: 'Selecione pelo menos um produto',
        });

        return;
      }

      if (data.code === coupon.code) {
        form.setError(`code`, {
          type: 'manual',
          message: 'Código de desconto não pode ser igual ao existente',
        })

        return;
      }

      if (coupon?.id) {
        await api.put(`/coupons/${coupon.id}`, {
          data: {
            ...data,
            initialCepRange: !data.initialCepRange
              ? null
              : data.initialCepRange,
            finalCepRange: !data.finalCepRange ? null : data.finalCepRange,
            automatic: data.method === 'auto',
            code:
              data.method === 'auto' && !data.code
                ? `auto-${new Date().getTime()}`
                : data.code,
          },
        });

        return;
      }

      const response = await api.post('/coupons', {
        data: {
          ...data,
          initialCepRange: !data.initialCepRange ? null : data.initialCepRange,
          finalCepRange: !data.finalCepRange ? null : data.finalCepRange,
          automatic: data.method === 'auto',
          code:
            data.method === 'auto' ? `auto-${new Date().getTime()}` : data.code,
        },
      });

      await router.push(`/coupons/edit/${response.data.data.id}`);
    },
  );

  const onCreateOrUpdateSubmit: SubmitHandler<
    CreateOrUpdateCouponSchemaProps
  > = async (data) => {
    await handleCreateOrUpdateCoupon(data);
  };

  return (
    <FormProvider formState={formState} handleSubmit={handleSubmit} {...form}>
      <Form onSubmit={handleSubmit(onCreateOrUpdateSubmit)}>
        <Row>
          <Col lg={8}>
            {type === 'product-quantity' && (
              <ByQuantity code={coupon?.code ?? ''} />
            )}
            {type === 'value' && (
              <ByQuantityInProducts code={coupon?.code ?? ''} />
            )}
            {type === 'buy_and_earn' && (
              <BuyAndEarn code={coupon?.code ?? ''} />
            )}
            {type === 'free_shipping' && (
              <FreeShipping code={coupon?.code ?? ''} />
            )}
          </Col>

          <Col lg={4}>
            <Resume />
            <Row>
              <Col>
                <Link
                  className="btn btn-light shadow-none border-0"
                  href="/coupons"
                  style={{
                    width: '100%',
                    background: 'rgb(64, 81, 137, 0.1)',

                    color: '#405189',
                  }}
                >
                  Descartar
                </Link>
              </Col>

              <Col>
                <Button
                  color="success"
                  style={{
                    width: '100%',
                  }}
                  className={clsx('shadow-none border-0', {
                    'btn-load': formState.isSubmitting,
                  })}
                >
                  {formState.isSubmitting ? (
                    <span className="d-flex align-items-center justify-content-center">
                      <Spinner
                        size="sm"
                        className="flex-shrink-0"
                        role="status"
                      >
                        {coupon?.id ? 'Atualizando...' : 'Adicionando...'}
                      </Spinner>
                      <span className="ms-2">
                        {coupon?.id ? 'Atualizando...' : 'Adicionando...'}
                      </span>
                    </span>
                  ) : (
                    <>{coupon?.id ? 'Atualizar' : 'Adicionar'}</>
                  )}
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </FormProvider>
  );
}
