import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import {
  Button,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Label,
  Row,
  Spinner,
} from 'reactstrap';

import { api } from '../../../services/apiClient';
import { queryClient } from '../../../services/react-query';
import { TimeUpdated } from '../../TimeUpdated';
import { Products } from './Products';
import { Relations } from './Relations';
import { CreateOrUpdatePriceListSchema, priceListSchema } from './schema';

type Props = {
  priceList?: CreateOrUpdatePriceListSchema & {
    id: number;
    updatedAt: string;
    createdAt: string;
  };
};

const DEFAULT_COUPON: CreateOrUpdatePriceListSchema = {
  name: '',
  enabled: false,
  productPrices: [],
};

export function CreateOrUpdatePriceList({ priceList }: Props) {
  const router = useRouter();
  const { formState, handleSubmit, register, ...form } =
    useForm<CreateOrUpdatePriceListSchema>({
      defaultValues: {
        ...DEFAULT_COUPON,
        ...priceList,
      },
      resolver: zodResolver(priceListSchema),
    });

  const { mutateAsync: createOrUpdateFn } = useMutation(
    async (data: CreateOrUpdatePriceListSchema) => {
      try {
        if (priceList) {
          await api.put(`/price-lists/${priceList.id}`, {
            data: {
              ...data,
            },
          });

          return;
        }

        const response = await api.post('/price-lists', {
          data: {
            ...data,
          },
        });
        await router.push(
          `/price-lists/edit/${response.data.data.id}?success=true&message=Lista de preços criada com sucesso!`,
        );
      } catch (error) {
        console.log('Não foi possível criar a lista de preços');
      }
    },
    {
      onSuccess: (_, variables) => {
        if (priceList?.id) {
          queryClient.invalidateQueries(['price-lists', priceList.id]);
        }
      },
    },
  );

  const onCreateOrUpdateSubmit: SubmitHandler<
    CreateOrUpdatePriceListSchema
  > = async (data) => {
    await createOrUpdateFn(data);
  };

  return (
    <FormProvider
      formState={formState}
      handleSubmit={handleSubmit}
      register={register}
      {...form}
    >
      <Form onSubmit={handleSubmit(onCreateOrUpdateSubmit)}>
        <Row>
          <Col lg={8}>
            <Card>
              <Card.Body>
                <h4 className="fs-5 text-body m-0 fw-bold">Dados da lista</h4>
                <p>Insira as principais informações sobre a lista de preço</p>

                <FormGroup>
                  <Label className="form-label" htmlFor="name">
                    Nome*
                  </Label>
                  <Input
                    type="text"
                    id="name"
                    placeholder="Insira o título da lista de preço"
                    invalid={!!formState.errors.name}
                    {...register('name')}
                  />
                  {formState.errors.name && (
                    <FormFeedback type="invalid">
                      {formState.errors.name.message}
                    </FormFeedback>
                  )}
                </FormGroup>
              </Card.Body>
            </Card>

            <Products />
          </Col>

          <Col lg={4}>
            <Card className="shadow-none">
              <Card.Header>
                <h4 className="fs-5 text-body m-0 fw-bold">Informação</h4>
              </Card.Header>

              <Card.Body>
                <div className="mb-3 d-flex align-items-center justify-content-between">
                  <h5
                    className="fw-bold"
                    style={{
                      fontSize: '0.875rem',
                      marginBottom: '0',
                    }}
                  >
                    Criada
                  </h5>

                  <p className="mb-0">
                    <TimeUpdated
                      time={
                        priceList?.createdAt
                          ? new Date(priceList?.createdAt)
                          : new Date()
                      }
                    />
                  </p>
                </div>

                {/*<div className="mb-3 d-flex align-items-center justify-content-between">
                  <h5
                    className="fw-bold"
                    style={{
                      fontSize: '0.875rem',
                      marginBottom: '0',
                    }}
                  >
                    Por
                  </h5>

                  <p className="mb-0">Nalu nalu</p>
                </div>*/}

                <div className="mb-3 d-flex align-items-center justify-content-between">
                  <h5
                    className="fw-bold"
                    style={{
                      fontSize: '0.875rem',
                      marginBottom: '0',
                    }}
                  >
                    Última atualização
                  </h5>

                  <p className="mb-0">
                    <TimeUpdated
                      time={
                        priceList?.updatedAt
                          ? new Date(priceList?.updatedAt)
                          : new Date()
                      }
                    />
                  </p>
                </div>

                {/*<div className="mb-3 d-flex align-items-center justify-content-between">
                  <h5
                    className="fw-bold"
                    style={{
                      fontSize: '0.875rem',
                      marginBottom: '0',
                    }}
                  >
                    Por
                  </h5>

                  <p className="mb-0">Nalu nalu</p>
                </div>*/}
              </Card.Body>
            </Card>

            <Relations />

            <Row>
              <Col>
                <Link
                  className="btn btn-light shadow-none border-0"
                  href="/price-lists"
                  style={{
                    width: '100%',
                    background: '#F06548',

                    color: '#fff',
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
                        {priceList?.id ? 'Editando...' : 'Criando...'}
                      </Spinner>
                      <span className="ms-2">
                        {priceList?.id ? 'Editando...' : 'Criando...'}
                      </span>
                    </span>
                  ) : (
                    <>{priceList?.id ? 'Editar' : 'Criar'} lista</>
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
