import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { Button, Col, Form, Row, Spinner, UncontrolledAlert } from 'reactstrap';

import { useLayout } from '@growth/growforce-admin-ui/hooks/useLayout';
import truncate from 'lodash/truncate';
import { useEffect, useState } from 'react';
import {
  IStrapiBanner,
  IStrapiFileResponse,
  IStrapiImage,
} from '../../../@types/strapi';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/apiClient';
import { queryClient } from '../../../services/react-query';
import { convert_banner_strapi } from '../../../utils/convertions/convert_banner';
import { ConfirmationModal } from '../../ConfirmationModal';
import { GoBackModal } from '../../GoBackModal';
import { TimeUpdated } from '../../TimeUpdated';
import { CategoryRelation } from './CategoryRelation';
import { DesktopImage } from './DesktopImage';
import { MainBanner } from './MainBanner';
import { MobileImage } from './MobileImage';
import { ProductRelation } from './ProductRelation';
import { bannersSchema, CreateOrUpdateBannerSchemaProps } from './schema';

type Props = {
  desktopImage?: IStrapiImage;
  mobileImage?: IStrapiImage;
  banner?: CreateOrUpdateBannerSchemaProps & {
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

export function CreateOrEditBanners({
  banner,
  desktopImage,
  mobileImage,
}: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingImages, setUploadingImages] = useState<File[] | null>(null);
  const [uploadingImageMobile, setUploadingImageMobile] = useState<
    File[] | null
  >(null);

  const form = useForm<CreateOrUpdateBannerSchemaProps>({
    defaultValues: {
      ...DEFAULT_BANNER,
      ...banner,
    },
    resolver: zodResolver(bannersSchema),
  });

  const { formState, handleSubmit, register, setValue } = form;

  const { handleChangeLoading } = useLayout();

  function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  const uploadImagesPreview = uploadingImages
    ? uploadingImages.map((file) => ({
      preview: URL.createObjectURL(file),
      formattedSize: formatBytes(file.size),
      name: truncate(file.name, {
        length: 28,
      }),
    }))
    : [];

  const uploadImagesPreviewMobile = uploadingImageMobile
    ? uploadingImageMobile.map((file) => ({
      preview: URL.createObjectURL(file),
      formattedSize: formatBytes(file.size),
      name: truncate(file.name, {
        length: 28,
      }),
    }))
    : [];

  const { mutateAsync: createOrUpdateFn } = useMutation(
    async (data: CreateOrUpdateBannerSchemaProps) => {
      if (banner) {
        handleChangeLoading({
          description: 'Salvando imagem',
          title: 'Carregando',
        });

        await api.put(`/banners/${banner.id}`, {
          data: {
            ...data,
            updatedBy: user?.id,
          },
        });

        handleChangeLoading(null);
        return;
      }

      const response = await api.post('/banners', {
        data: {
          ...data,
          createdBy: user?.id,
          updatedBy: user?.id,
        },
      });
      await router.push(
        `/banners/edit/${response.data.data.id}?success=true&message=Banner criado com sucesso!`,
      );
    },
    {
      onSuccess: (_, variables) => {
        if (banner?.id) {
          queryClient.setQueryData(['banner', banner.id], {
            ...banner,
            ...variables,
            updatedAt: new Date(),
          });
        }
      },
    },
  );

  const onCreateOrUpdateSubmit: SubmitHandler<
    CreateOrUpdateBannerSchemaProps
  > = async (data) => {
    await createOrUpdateFn(data);
  };

  const { mutateAsync: uploadImages } = useMutation(
    async ({
      imagesToAdd,
      name,
    }: {
      imagesToAdd: File[];
      name: 'desktop_image_id' | 'mobile_image_id';
    }) => {
      handleChangeLoading({
        description: 'Salvando imagem',
        title: 'Carregando',
      });

      if (name === 'desktop_image_id') {
        setUploadingImages(imagesToAdd);
      } else if (name === 'mobile_image_id') {
        setUploadingImageMobile(imagesToAdd);
      }

      const files = [...imagesToAdd];

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('files', file);
        });

        const response = await api.post<IStrapiFileResponse[]>(
          '/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const { loaded, total } = progressEvent;
              const percent = Math.floor((loaded * 100) / total);
              setUploadProgress(percent);
            },
          },
        );

        setValue(name, response.data[0].id);
        setUploadProgress(0);
      }

      handleChangeLoading(null);
    },
  );

  const [isChangingPublishStatus, setIsChangingPublishStatus] = useState(false);
  const { mutateAsync: handleChangePublishStatus } = useMutation(
    async () => {
      setIsChangingPublishStatus(true);
      try {
        if (!banner?.id) return;

        let publishedAt = null;

        if (!banner?.publishedAt) {
          publishedAt = new Date();
        }

        const response = await api.put(`/banners/${banner?.id}`, {
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
        if (banner?.id) {
          queryClient.setQueryData(['banner', banner.id], () => {
            return convert_banner_strapi(response as IStrapiBanner);
          });
        }
      },
    },
  );

  useEffect(() => {
    if (desktopImage?.id) {
      setValue('desktop_image_id', desktopImage.id);
    }

    if (mobileImage?.id) {
      setValue('mobile_image_id', mobileImage.id);
    }
  }, [desktopImage, mobileImage]);

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
                <Row>
                  <Col md={12}>
                    <div className="d-flex align-items-center">
                      <h6 className="card-title mb-1">Imagens</h6>
                    </div>
                  </Col>
                </Row>
              </Card.Header>

              <Card.Body>
                <Row>
                  <Col md={12}>
                    <DesktopImage
                      formatBytes={formatBytes}
                      desktopImage={desktopImage}
                      uploadImages={uploadImages}
                      uploadImagesPreview={uploadImagesPreview}
                      uploadProgress={uploadProgress}
                    />
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={12}>
                    <MobileImage
                      formatBytes={formatBytes}
                      mobileImage={mobileImage}
                      uploadImages={uploadImages}
                      uploadImagesPreviewMobile={uploadImagesPreviewMobile}
                      uploadProgress={uploadProgress}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            {banner?.id && banner?.publishedAt && (
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

            {banner?.id && !banner?.publishedAt && (
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
                  <GoBackModal backPage="/banners">
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
                      color={banner.publishedAt ? 'danger' : 'primary'}
                      type="button"
                      className="shadow-none"
                      style={{
                        width: '100%',
                      }}
                    >
                      {isChangingPublishStatus ? (
                        <Spinner color="primary" size="sm" />
                      ) : (
                        <>{banner.publishedAt ? 'Despublicar' : 'Publicar'}</>
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
                        banner?.createdAt
                          ? new Date(banner?.createdAt)
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
                        banner?.updatedAt
                          ? new Date(banner?.updatedAt)
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

            <Card className="shadow-none">
              <Card.Header>
                <h4 className="fs-5 text-body m-0 fw-bold">Relacionamentos</h4>
              </Card.Header>

              <Card.Body>
                <Row>
                  <Col lg={12}>
                    <CategoryRelation banner={banner} />
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col lg={12}>
                    <ProductRelation banner={banner} />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </FormProvider>
  );
}
