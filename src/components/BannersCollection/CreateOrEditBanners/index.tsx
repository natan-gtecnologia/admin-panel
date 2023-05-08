import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import {
  FormProvider,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import {
  Button,
  Col,
  Row,
  Form,
  UncontrolledAlert,
  Spinner,
} from 'reactstrap';

import { IStrapiBanner, IStrapiImage } from '../../../@types/strapi';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/apiClient';
import { queryClient } from '../../../services/react-query';
import { TimeUpdated } from '../../TimeUpdated';
import { bannersSchema, CreateOrUpdateBannerSchemaProps } from './schema';
import { useState } from 'react';
import { BannerRelation } from './BannerRelation';
import { GoBackModal } from '../../GoBackModal';
import { ConfirmationModal } from '../../ConfirmationModal';
import { convert_banner_strapi } from '../../../utils/convertions/convert_banner';
import { MainBanner } from './MainBanner';

type Props = {
  desktopImage?: IStrapiImage;
  mobileImage?: IStrapiImage;
  banner?: CreateOrUpdateBannerSchemaProps & {
    attributes: any;
    id: number;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
  };
};

const DEFAULT_BANNER: CreateOrUpdateBannerSchemaProps = {
  type: null,
  title: '',
  page_link: null,
  page: null,
  link_type: null,
  order: 0,
  desktop_image_id: null,
  mobile_image_id: null,
  category_link_id: null,
  product_link_id: null,
};

export function CreateOrEditBanners({ banner }: Props) {

  const router = useRouter();
  const { user } = useAuth();
  const [handlePublish, setHandlePublish] = useState(banner?.attributes.publishedAt)

  const form = useForm<CreateOrUpdateBannerSchemaProps>({
    defaultValues: {
      ...DEFAULT_BANNER,
      banner: [{}],
      ...banner?.attributes,
    },
    resolver: zodResolver(bannersSchema),
  });

  const {
    formState,
    handleSubmit,
    register,
  } = form;

  const { mutateAsync: createOrUpdateFn } = useMutation(
    async (data: CreateOrUpdateBannerSchemaProps) => {
      const response = await api.post('/banner-collections', {
        data: {
          ...data,
          createdBy: user?.id,
          updatedBy: user?.id,
          publishedAt: null,
        },
      });
      await router.push(
        `/colecao-banners/edit/${response.data.data.id}?success=true&message=Banner criado com sucesso!`
      );
    },
    {
      onSuccess: (_, variables) => {
        if (banner?.id) {
          queryClient.setQueryData(['banner-collections', banner.id], {
            ...banner,
            ...variables,
          });
        }
      },
    }
  );

  const onCreateOrUpdateSubmit: SubmitHandler<
    CreateOrUpdateBannerSchemaProps
  > = async (data) => {
    banner ? await handleChangePublishStatus(data) : await createOrUpdateFn(data)
  };

  const [isChangingPublishStatus, setIsChangingPublishStatus] = useState(false);
  const { mutateAsync: handleChangePublishStatus } = useMutation(
    async (data: any) => {
      setIsChangingPublishStatus(true);
      try {
        if (!banner?.id) return;

        let publishedAt = null;

        if (!handlePublish) {
          publishedAt = new Date();
        }

        const response = await api.put(`/banner-collections/${banner?.id}`, {
          data: {
            ...data,
            publishedAt
          },
        });

        setHandlePublish(response.data.data?.attributes?.publishedAt)

        return response.data.data;
      } finally {
        setIsChangingPublishStatus(false);
      }
    },
    {
      onSuccess: (response) => {
        if (banner?.id) {
          queryClient.setQueryData(['banner', banner.id], () => {
            return convert_banner_strapi(response as IStrapiBanner);
          });
        }
      },
    }
  );

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
            <MainBanner />
            <Card>
              <Card.Header>
                <BannerRelation banner={banner} />
              </Card.Header>
            </Card>
          </Col >

          <Col lg={4}>
            {banner?.id && banner?.attributes.publishedAt && (
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

            {banner?.id && !banner?.attributes.publishedAt && (
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
                {!banner?.id ? (
                  <GoBackModal backPage="/colecao-banners">
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
                  <ConfirmationModal changeStatus={handleChangePublishStatus}>
                    <Button
                      color={handlePublish ? 'danger' : 'primary'}
                      type="button"
                      className="shadow-none"
                      style={{
                        width: '100%',
                      }}
                    >
                      {isChangingPublishStatus ? (
                        <Spinner color="primary" size="sm" />
                      ) : (
                        <>{handlePublish ? 'Despublicar' : 'Publicar'}</>
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
                        {banner?.id ? 'Editando...' : 'Salvando...'}
                      </Spinner>
                      <span className="ms-2">
                        {banner?.id ? 'Editando...' : 'Salvando...'}
                      </span>
                    </span>
                  ) : (
                    <>{banner?.id ? 'Editar' : 'Salvar'}</>
                  )}
                </Button>
              </Col>
            </Row>

            {banner?.id &&
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
                          banner?.attributes.createdAt ? new Date(banner?.attributes.createdAt) : new Date()
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
                          banner?.attributes.updatedAt ? new Date(banner?.attributes.updatedAt) : new Date()
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
            }

          </Col>
        </Row >
      </Form >
    </FormProvider >
  );
}
