/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import { useLayout } from '@growth/growforce-admin-ui/hooks/useLayout';
import {
  Col,
  FormFeedback,
  Label,
  Row,
} from '@growth/growforce-admin-ui/index';
import { useMutation } from '@tanstack/react-query';
import update from 'immutability-helper';
import truncate from 'lodash/truncate';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import Dropzone from 'react-dropzone';
import { useFormContext } from 'react-hook-form';

import { IStrapiFileResponse, IStrapiImage } from '../../../@types/strapi';
import { api } from '../../../services/apiClient';
import { GaleryImage } from './GaleryImage';
import { CreateOrEditProductSchemaProps } from './schema';

type Props = {
  images?: IStrapiImage[];
};

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function ProductGalery({ images: fromEditImagesPreview }: Props) {
  const { formState, watch, setValue, getValues } =
    useFormContext<CreateOrEditProductSchemaProps>();
  const newProductImage = watch('product_image');
  const newProductImagePreview =
    typeof newProductImage !== 'undefined' && newProductImage.length > 0
      ? {
        preview: URL.createObjectURL(newProductImage[0]),
        formattedSize: formatBytes(newProductImage[0].size),
        name: truncate(newProductImage[0].name, {
          length: 28,
        }),
      }
      : null;
  const [images, setImages] = useState(
    fromEditImagesPreview.length > 1
      ? fromEditImagesPreview.filter((_, index) => index !== 0)
      : [],
  );
  const [uploadingImages, setUploadingImages] = useState<File[] | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const product_image = fromEditImagesPreview ? fromEditImagesPreview[0] : null;
  const uploadImagesPreview = uploadingImages
    ? uploadingImages.map((file) => ({
      preview: URL.createObjectURL(file),
      formattedSize: formatBytes(file.size),
      name: truncate(file.name, {
        length: 28,
      }),
    }))
    : [];
  const product_images = watch('images');
  const imagesWithoutProductImage = images.filter(
    (image) =>
      product_images.includes(image.id) && image.id !== product_image?.id,
  );
  const { handleChangeLoading } = useLayout();

  const { mutateAsync: uploadImages } = useMutation(
    async (imagesToAdd: File[]) => {
      handleChangeLoading({
        description: 'Salvando imagem',
        title: 'Carregando',
      });
      setUploadingImages(imagesToAdd);
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

        const ids = response.data.map((file) => file.id);

        const images = [...product_images, ...ids];
        setValue('images', images);
        setUploadingImages(null);
        setImages((old) => [
          ...old,
          ...response.data.map((file) => ({
            id: file.id,
            attributes: {
              ...file,
            },
          })),
        ]);

        setUploadProgress(0);
      }

      handleChangeLoading(null);
    },
  );

  const { mutateAsync: handleUploadProductImage } = useMutation(
    async (file: File) => {
      handleChangeLoading({
        description: 'Salvando imagem',
        title: 'Carregando',
      });

      const formData = new FormData();
      formData.append('files', file);

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

      if (response.data.length > 0) {
        setValue('product_image_id', response.data[0].id);
      }

      handleChangeLoading(null);
    },
  );

  // drag and drop
  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const images = getValues('images').filter(
        (image) => image !== product_image?.id,
      );

      const dragCard = images[dragIndex];
      const newImages = update(images, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragCard],
        ],
      });

      setValue('images', newImages);
      setImages((prevCards) => {
        return update(prevCards, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, prevCards[dragIndex]],
          ],
        });
      });
    },
    [getValues, product_image?.id, setValue],
  );

  return (
    <Card className="shadow-none">
      <Card.Header>
        <h4 className="m-0">Galeria de produtos</h4>
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          <Label className="form-label mb-1 fs-5" htmlFor="product_image">
            Imagem do Produto
          </Label>
          <small className="d-block mb-2 text-muted fs-6">
            Adicione a imagem principal do produto.
          </small>
          <Input
            type="file"
            id="product_image"
            placeholder="Insira o título do produto"
            invalid={!!formState.errors.product_image}
            accept="image/*"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const { files } = e.target;
              if (files) {
                setValue('product_image', files);
              }

              if (files && files.length > 0) {
                const file = files[0];

                handleUploadProductImage(file);
              }
            }}
          />
          {!!formState.errors.product_image && (
            <FormFeedback type="invalid">
              {formState.errors.product_image.message.toString()}
            </FormFeedback>
          )}

          {typeof newProductImage !== 'undefined' &&
            newProductImage.length > 0 && (
              <Card className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete">
                <div className="p-2">
                  <Row className="align-items-center">
                    <Col className="col-auto">
                      <img
                        data-dz-thumbnail=""
                        height="80"
                        className="avatar-sm rounded bg-light"
                        alt={newProductImagePreview.name}
                        src={newProductImagePreview.preview}
                      />
                    </Col>
                    <Col>
                      <Link href="#" className="text-muted font-weight-bold">
                        {newProductImagePreview.name}
                      </Link>
                      <p className="mb-0">
                        <strong>{newProductImagePreview.formattedSize}</strong>
                      </p>
                    </Col>
                  </Row>
                </div>
              </Card>
            )}

          {!newProductImage && product_image && (
            <Card className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete">
              <div className="p-2">
                <Row className="align-items-center">
                  <Col className="col-auto">
                    <img
                      data-dz-thumbnail=""
                      height="80"
                      className="avatar-sm rounded bg-light"
                      alt={product_image.attributes.name}
                      src={product_image.attributes.formats?.thumbnail?.url}
                    />
                  </Col>
                  <Col>
                    <Link href="#" className="text-muted font-weight-bold">
                      {product_image.attributes.name}
                    </Link>
                    <p className="mb-0">
                      <strong>
                        {formatBytes(product_image.attributes.size * 1000)}
                      </strong>
                    </p>
                  </Col>
                </Row>
              </div>
            </Card>
          )}
        </div>

        <div>
          <Label className="form-label mb-1 fs-5" htmlFor="product_galery">
            Galeria de produtos
          </Label>
          <small className="d-block mb-2 text-muted fs-6">
            Máx. de 5MB. Tamanho recomendado: 280x280. Formatos aceitos: JPG,
            PNG, WEBP
          </small>
          <Dropzone
            onDropAccepted={(files) => {
              uploadImages(files);
            }}
            maxSize={5000000}
            accept={['image/jpeg', 'image/png', 'image/webp']}
          >
            {({ getRootProps }) => (
              <div className="dropzone dz-clickable  d-flex align-items-center justify-content-center">
                <div className="dz-message needsclick" {...getRootProps()}>
                  <div className="mb-3">
                    <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                  </div>
                  <h4 className="mb-0">
                    Solte os arquivos aqui ou clique para fazer o upload.
                  </h4>
                </div>
              </div>
            )}
          </Dropzone>

          <Row
            className="list-unstyled mb-0"
            id="file-previews"
            style={
              {
                //rowGap: 8,
              }
            }
          >
            {imagesWithoutProductImage.map((image, index) => (
              <GaleryImage
                id={image.id}
                key={`${image.id}-preview-from-db`}
                name={image.attributes.name}
                url={image.attributes.formats.thumbnail.url}
                size={formatBytes(image.attributes.size * 1000)}
                index={index}
                moveCard={moveCard}
              />
            ))}
            {uploadImagesPreview.map((image) => (
              <Col lg={6} key={`${image.name}-from-edit-image`}>
                <Card className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete">
                  <div className="p-2">
                    <Row className="align-items-center">
                      <Col className="col-auto">
                        <CircularProgressbarWithChildren
                          value={uploadProgress}
                          background
                          backgroundPadding={6}
                          className="avatar-sm"
                          minValue={0}
                          maxValue={100}
                          styles={{
                            path: {
                              stroke: '#4b38b3',
                            },
                          }}
                          strokeWidth={10}
                        >
                          <img
                            data-dz-thumbnail=""
                            height="80"
                            className="avatar-sm rounded bg-light"
                            alt={image.name}
                            src={image.preview}
                            style={{
                              zIndex: 0,
                              position: 'absolute',
                            }}
                          />
                        </CircularProgressbarWithChildren>
                      </Col>
                      <Col>
                        <Link href="#" className="text-muted font-weight-bold">
                          {image.name}
                        </Link>
                        <p className="mb-0">
                          <strong>{image.formattedSize}</strong>
                        </p>
                      </Col>
                    </Row>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
}
