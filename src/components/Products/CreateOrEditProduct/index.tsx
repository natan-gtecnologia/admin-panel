/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import {
  Button,
  Col,
  Form,
  Row,
  Spinner,
  UncontrolledAlert,
} from '@growth/growforce-admin-ui/index';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { FC, useState } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { convert_product_strapi } from '../../../utils/convertions/convert_product';

import { IStrapiImage, IStrapiProduct } from '../../../@types/strapi';
import { api } from '../../../services/apiClient';
import { queryClient } from '../../../services/react-query';
import { GoBackModal } from '../../GoBackModal';
import { ProductCategories } from './ProductCategories';
//import action

import { useLayout } from '@growth/growforce-admin-ui/hooks/useLayout';
import { ConfirmationModal } from '../../ConfirmationModal';
import { TimeUpdated } from '../../TimeUpdated';
import {
  createOrEditProductSchema,
  CreateOrEditProductSchemaProps,
} from './schema';

const ProductInfo = dynamic(
  async () => (await import('./ProductInfo')).ProductInfo,
  {
    ssr: false,
  },
);
const ProductGalery = dynamic(
  async () => (await import('./ProductGalery')).ProductGalery,
  {
    ssr: false,
  },
);
const ProductOptions = dynamic(
  async () => (await import('./ProductOptions')).ProductOptions,
  {
    ssr: false,
  },
);
const ProductRelations = dynamic(
  async () => (await import('./ProductRelations')).ProductRelations,
  {
    ssr: false,
  },
);
const ProductStock = dynamic(
  async () => (await import('./ProductStock')).ProductStock,
  {
    ssr: false,
  },
);
const ProductsType = dynamic(
  async () => (await import('./ProductsType')).ProductsType,
  {
    ssr: false,
  },
);
const ProductTags = dynamic(
  async () => (await import('./ProductTags')).ProductTags,
  {
    ssr: false,
  },
);
const SchedulePublication = dynamic(
  async () => (await import('./SchedulePublication')).SchedulePublication,
  {
    ssr: false,
  },
);

type CreateOrEditProductProps = {
  product?: CreateOrEditProductSchemaProps & {
    id: number;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
  };

  images?: IStrapiImage[];
};

const DEFAULT_VALUES: CreateOrEditProductSchemaProps = {
  id: null,
  title: '',
  description: '',
  groupType: 'simple',
  status: 'available',
  productType: 'physical',
  featured: false,
  dimension: null,
  images: [],
  product_image_id: null,
  categories: [],
  tags: [],
  stockStatus: 'in_stock',
  stockQuantity: 0,
  brand: null,
  distribution_centers: [],
  sku: '',
  relationed_products: [],
  variations: [],
};

const CreateOrEditProduct: FC<CreateOrEditProductProps> = ({
  product,
  images = [],
}) => {
  const router = useRouter();
  const { formState, handleSubmit, ...useFormProps } =
    useForm<CreateOrEditProductSchemaProps>({
      resolver: zodResolver(createOrEditProductSchema),
      defaultValues: product || DEFAULT_VALUES,
    });
  const { handleChangeLoading } = useLayout();

  const { mutateAsync: handleCreateOrUpdate } = useMutation(
    async (data: CreateOrEditProductSchemaProps) => {
      try {
        handleChangeLoading({
          description: 'Salvando produto',
          title: 'Carregando',
        });
        const schedulePublication = data.schedulePublication;
        delete data.schedulePublication;

        const regularPrice =
          data.price.salePrice > data.price.regularPrice
            ? data.price.salePrice
            : data.price.regularPrice;
        delete data.price.regularPrice;

        if (data.groupType === 'simple') {
          delete data.groupedProducts;
        }

        if (product?.id) {
          const images =
            data.product_image_id !== product.product_image_id
              ? [
                data.product_image_id,
                ...data.images.filter(
                  (image) => image !== product.product_image_id,
                ),
              ]
              : data.images;
          const response = await api.put(`/products/${product.id}`, {
            data: {
              ...data,
              company: 1,
              ...(schedulePublication && {
                publishedAt: schedulePublication,
              }),
              images,
              price: {
                ...data.price,
                regularPrice,
              },
            },
          });

          handleChangeLoading(null);
          return convert_product_strapi(response.data.data);
        }

        const response = await api.post('/products', {
          data: {
            ...data,
            company: 1,
            ...(schedulePublication && {
              publishedAt: schedulePublication,
            }),
            price: {
              ...data.price,
              regularPrice,
            },
            images: [data.product_image_id, ...data.images],
          },
        });

        handleChangeLoading(null);

        await router.push(`/products/edit/${response.data.id}`);
      } catch {
        handleChangeLoading(null);
      }
    },
    {
      onSuccess: (data) => {
        if (product?.id) {
          queryClient.setQueryData(['product', product.id], {
            ...data,
            updatedAt: new Date(),
          });
          //queryClient.invalidateQueries(['products', product.id]);
        }
      },
    },
  );

  const [isChangingPublishStatus, setIsChangingPublishStatus] = useState(false);
  const { mutateAsync: handleChangePublishStatus } = useMutation(
    async () => {
      setIsChangingPublishStatus(true);
      try {
        if (!product?.id) return;

        let publishedAt = null;

        if (!product?.publishedAt) {
          publishedAt = new Date();
        }

        const response = await api.put(`/products/${product?.id}`, {
          data: {
            publishedAt,
          },
        });

        return response.data.data;
      } finally {
        setIsChangingPublishStatus(false);
      }
    },
    {
      onSuccess: (response) => {
        if (product?.id) {
          queryClient.setQueryData(['product', product.id], () => {
            return convert_product_strapi(response as IStrapiProduct);
          });
        }
      },
    },
  );

  const onCreateOrUpdateProductSubmit: SubmitHandler<
    CreateOrEditProductSchemaProps
  > = async (data) => {
    await handleCreateOrUpdate(data);
  };

  return (
    <FormProvider
      formState={formState}
      handleSubmit={handleSubmit}
      {...useFormProps}
    >
      <Form onSubmit={handleSubmit(onCreateOrUpdateProductSubmit)}>
        <Row>
          <Col lg={8}>
            <ProductInfo productId={product?.id ?? undefined} />
            <ProductsType />
            <ProductOptions />
            <ProductGalery images={images} />
            <ProductStock />

            <Row className="mb-4 justify-content-between">
              <Col lg={3}>
                <GoBackModal backPage="/products/">
                  <Button
                    className="btn btn-light shadow-none border-0"
                    style={{
                      width: '100%',
                      background: 'rgb(64, 81, 137, 0.1)',

                      color: '#405189',
                    }}
                  >
                    Voltar
                  </Button>
                </GoBackModal>
              </Col>

              <Col lg={6}>
                <Row>
                  <Col>
                    {!product?.id ? (
                      <GoBackModal backPage="/products/">
                        <Button
                          className="btn btn-light shadow-none border-0"
                          style={{
                            width: '100%',
                            background: 'rgb(64, 81, 137, 0.1)',

                            color: '#405189',
                          }}
                        >
                          Descartar
                        </Button>
                      </GoBackModal>
                    ) : (
                      <ConfirmationModal
                        changeStatus={() => handleChangePublishStatus()}
                      >
                        <Button
                          color={product.publishedAt ? 'danger' : 'primary'}
                          type="button"
                          className="shadow-none"
                          style={{
                            width: '100%',
                          }}
                        >
                          {isChangingPublishStatus ? (
                            <Spinner color="primary" size="sm" />
                          ) : (
                            <>
                              {product.publishedAt ? 'Despublicar' : 'Publicar'}
                            </>
                          )}
                        </Button>
                      </ConfirmationModal>
                    )}
                  </Col>

                  <Col>
                    <Button
                      color="success"
                      style={{
                        width: '100%',
                      }}
                      className="shadow-none border-0"
                    >
                      {formState.isSubmitting ? (
                        <span className="d-flex align-items-center justify-content-center">
                          <Spinner
                            size="sm"
                            className="flex-shrink-0"
                            role="status"
                          >
                            {product?.id ? 'Editando...' : 'Adicionando...'}
                          </Spinner>
                          <span className="ms-2">
                            {product?.id ? 'Editando...' : 'Adicionando...'}
                          </span>
                        </span>
                      ) : (
                        <>{product?.id ? 'Editar' : 'Adicionar'} Produto</>
                      )}
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>

          <Col lg={4}>
            {product?.id && product?.publishedAt && (
              <Card className="p-0 shadow-none">
                <UncontrolledAlert
                  color="light"
                  className="alert-solid m-0"
                  style={{
                    background: '#FAFAFA',
                    color: '#405189',
                  }}
                >
                  Você está editando a versão publicada!
                </UncontrolledAlert>
              </Card>
            )}

            {product?.id && !product?.publishedAt && (
              <Card className="p-0 shadow-none">
                <UncontrolledAlert
                  color="light"
                  className="alert-solid m-0"
                  style={{
                    background: '#FAFAFA',
                    color: '#405189',
                  }}
                >
                  Você está editando a versão em rascunho!
                </UncontrolledAlert>
              </Card>
            )}

            <Row className="mb-4">
              <Col>
                {!product?.id ? (
                  <GoBackModal backPage="/products">
                    <Button
                      className="btn btn-light shadow-none border-0"
                      style={{
                        width: '100%',
                        background: 'rgb(64, 81, 137, 0.1)',

                        color: '#405189',
                      }}
                    >
                      Voltar
                    </Button>
                  </GoBackModal>
                ) : (
                  <ConfirmationModal changeStatus={() => handleChangePublishStatus()}>
                    <Button
                      color={product.publishedAt ? 'danger' : 'primary'}
                      type="button"
                      className="shadow-none"
                      style={{
                        width: '100%',
                      }}
                    >
                      {isChangingPublishStatus ? (
                        <Spinner color="primary" size="sm" />
                      ) : (
                        <>{product.publishedAt ? 'Despublicar' : 'Publicar'}</>
                      )}
                    </Button>
                  </ConfirmationModal>
                )}
              </Col>
              <Col>
                <Button
                  color="success"
                  style={{
                    width: '100%',
                  }}
                  className="shadow-none border-0"
                >
                  {formState.isSubmitting ? (
                    <span className="d-flex align-items-center justify-content-center">
                      <Spinner
                        size="sm"
                        className="flex-shrink-0"
                        role="status"
                      >
                        {product?.id ? 'Editando...' : 'Salvando...'}
                      </Spinner>
                      <span className="ms-2">
                        {product?.id ? 'Editando...' : 'Salvando...'}
                      </span>
                    </span>
                  ) : (
                    <>{product?.id ? 'Editar' : 'Salvar'}</>
                  )}
                </Button>
              </Col>
            </Row>

            <Card className="shadow-none">
              <Card.Header>
                <h5 className="mb-0">Informação</h5>
              </Card.Header>
              <Card.Body>
                <p className="d-flex alig-items-center justify-content-between">
                  <span>Criada</span>
                  <span>
                    <TimeUpdated
                      time={
                        product?.createdAt
                          ? new Date(product?.createdAt)
                          : new Date()
                      }
                    />
                  </span>
                </p>

                {/*<p className="d-flex alig-items-center justify-content-between">
                  <span>Por</span>
                  <span>Admin</span>
                </p>*/}

                <p className="d-flex alig-items-center justify-content-between">
                  <span>Última atualização</span>
                  <span>
                    <TimeUpdated
                      time={
                        product?.updatedAt
                          ? new Date(product?.updatedAt)
                          : new Date()
                      }
                    />
                  </span>
                </p>

                {/*<p className="d-flex alig-items-center justify-content-between mb-0">
                  <span>Por</span>
                  <span>Admin</span>
                </p>*/}
              </Card.Body>
            </Card>

            <SchedulePublication />
            <ProductCategories />
            <ProductRelations />
            <ProductTags />
          </Col>
        </Row>
      </Form>
    </FormProvider>
  );
};

export default CreateOrEditProduct;
