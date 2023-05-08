import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  FormProvider,
  SubmitHandler,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import { Button, Col, Form, Row, Spinner } from 'reactstrap';

import { ICategory } from '../../../@types/category';
import { IStrapiCategory } from '../../../@types/strapi';
import { api } from '../../../services/apiClient';
import { queryClient } from '../../../services/react-query';
import { convert_category_strapi } from '../../../utils/convertions/convert_category';
import { ConfirmationModal } from '../../ConfirmationModal';
import { MetaData } from '../../MetaData';
import { TimeUpdated } from '../../TimeUpdated';
import {
  CategoriesSchema,
  CreateOrUpdateCategoriesSchemaProps,
} from './schema';
const CreateCategory = dynamic(
  async () => (await import('./CreateCategory')).CreateCategory,
  {
    ssr: false,
  },
);

type Props = {
  category?: ICategory;
};

const DEFAULT_CATEGORY: CreateOrUpdateCategoriesSchemaProps = {
  id: null,
  title: '',
  description: '',
  slug: '',
  metaData: [],
};

export function CreateOrEditCategories({ category }: Props) {
  const router = useRouter();
  const { formState, handleSubmit, register, ...form } =
    useForm<CreateOrUpdateCategoriesSchemaProps>({
      defaultValues: {
        ...DEFAULT_CATEGORY,
        ...category,
      },
      resolver: zodResolver(CategoriesSchema),
    });
  const { fields, append, remove } = useFieldArray({
    control: form.control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'metaData', // unique name for your Field Array
  });
  const [isChangingPublishStatus, setIsChangingPublishStatus] = useState(false);

  const { mutateAsync: handleCreateOrUpdateCategory } = useMutation(
    async (data: CreateOrUpdateCategoriesSchemaProps) => {
      try {
        if (category) {
          await api.put(`/categories/${category.id}`, {
            data: {
              ...data,
              //updatedBy: user?.id,
            },
          });
          return;
        }

        const response = await api.post('/categories', {
          data: {
            ...data,
            //createdBy: user?.id,
            //updatedBy: user?.id,
          },
        });
        router.push(
          `/categories/edit/${response.data.data.id}?success=true&message=Categoria criada com sucesso!`,
        );
      } catch {
        console.log('error');
      }
    },
    {
      onSuccess: (_, variables) => {
        if (!category?.id) return;

        queryClient.setQueryData(['category', category.id], {
          ...category,
          ...variables,
          updatedAt: new Date(),
        });
      },
    },
  );

  const { mutateAsync: handleChangePublishStatus } = useMutation(
    async () => {
      setIsChangingPublishStatus(true);
      try {
        if (!category?.id) return;

        let publishedAt = null;

        if (!category?.publishedAt) {
          publishedAt = new Date();
        }

        const response = await api.put(`/categories/${category?.id}`, {
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
        if (category?.id) {
          queryClient.setQueryData(['category', category.id], () => {
            return convert_category_strapi(response as IStrapiCategory);
          });
        }
      },
    },
  );

  const onCreateOrUpdateSubmit: SubmitHandler<
    CreateOrUpdateCategoriesSchemaProps
  > = async (data) => {
    await handleCreateOrUpdateCategory(data);
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
            <CreateCategory categoryId={category?.id} />

            <Card>
              <Card.Header>
                <Row>
                  <div className="d-flex align-items-center">
                    <Col md={8}>
                      <div className="d-flex align-items-center">
                        <h6 className="card-title mb-0">Meta Data</h6>
                      </div>
                    </Col>

                    <Col md={4}>
                      <div className="d-flex justify-content-end">
                        <Button
                          color="link"
                          className="shadow-none"
                          onClick={() => append({})}
                        >
                          Adicionar nova
                        </Button>
                      </div>
                    </Col>
                  </div>
                </Row>
              </Card.Header>
              {fields.map((field, key) => (
                <Card.Body key={field.id}>
                  <MetaData indexKey={key} onRemove={remove} />
                </Card.Body>
              ))}
            </Card>
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
                        category?.createdAt
                          ? new Date(category?.createdAt)
                          : new Date()
                      }
                    />
                  </p>
                </div>

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
                        category?.updatedAt
                          ? new Date(category?.updatedAt)
                          : new Date()
                      }
                    />
                  </p>
                </div>

                <div className="mb-3 d-flex align-items-center justify-content-between">
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
                </div>
              </Card.Body>
            </Card>

            <Row>
              <Col>
                {category?.id ? (
                  <ConfirmationModal
                    message="Você está alterando o status da categoria. Ao clicar em confirmar, a categoria será alterado para o status selecionado."
                    changeStatus={() => handleChangePublishStatus()}
                  >
                    <Button
                      color={category.publishedAt ? 'danger' : 'primary'}
                      type="button"
                      className="shadow-none"
                      style={{
                        width: '100%',
                      }}
                    >
                      {isChangingPublishStatus ? (
                        <Spinner color="primary" size="sm" />
                      ) : (
                        <>{category.publishedAt ? 'Despublicar' : 'Publicar'}</>
                      )}
                    </Button>
                  </ConfirmationModal>
                ) : (
                  <Link
                    className="btn btn-light shadow-none border-0"
                    href="/categories"
                    style={{
                      width: '100%',
                      background: '#F06548',

                      color: '#fff',
                    }}
                  >
                    Descartar
                  </Link>
                )}
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
                        {category?.id ? 'Editando...' : 'Criando...'}
                      </Spinner>
                      <span className="ms-2">
                        {category?.id ? 'Editando...' : 'Criando...'}
                      </span>
                    </span>
                  ) : (
                    <>{category?.id ? 'Editar' : 'Adicionar'} categoria</>
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
