/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import {
  Col,
  FormFeedback,
  Label,
  Row,
} from '@growth/growforce-admin-ui/index';
import clsx from 'clsx';
import debounce from 'lodash/debounce';
import { useCallback } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import slugify from 'slugify';

import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import dynamic from 'next/dynamic';
import { CreateOrEditProductSchemaProps } from './schema';
import { validateProductSlug } from './slugValidationProduct';
const CKEditor = dynamic(
  async () => (await import('@ckeditor/ckeditor5-react')).CKEditor,
  {
    ssr: false,
  },
);

interface ProductInfoProps {
  productId?: number;
}

export function ProductInfo({ productId }: ProductInfoProps) {
  const { control, formState, register, setValue, setError, clearErrors } =
    useFormContext<CreateOrEditProductSchemaProps>();
  const { append, fields, remove } = useFieldArray({
    control,
    name: 'groupedProducts',
  });

  const validateSlug = async (value: string) => {
    if (formState.errors.slug) return;

    if (!value) {
      setError('slug', {
        type: 'required',
        message: 'Slug é obrigatório',
      });
    }

    if (value.length < 3) {
      setError('slug', {
        type: 'min',
        message: 'Slug deve conter no mínimo 3 caracteres',
      });
    }

    try {
      const isValid = await validateProductSlug(value, productId);

      if (!isValid) {
        setError('slug', {
          type: 'validate',
          message: 'Slug já está em uso',
        });
      } else {
        clearErrors('slug');
      }
    } catch {
      console.log('error');
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceValidateSlug = useCallback(debounce(validateSlug, 500), []);

  return (
    <Card className="shadow-none">
      <Card.Body>
        <Row className="mb-3">
          <Col>
            <div>
              <Label className="form-label" htmlFor="product-title-input">
                Título do produto
              </Label>
              <Input
                type="text"
                id="product-title-input"
                placeholder="Insira o título do produto"
                invalid={!!formState.errors.title}
                {...register('title', {
                  onChange(event) {
                    setValue(
                      'slug',
                      slugify(event.target.value, {
                        lower: true,
                        trim: true,
                      }),
                    );
                  },
                  onBlur: (e) => {
                    debounceValidateSlug(
                      slugify(e.target.value, {
                        lower: true,
                        trim: true,
                      }),
                    );
                  },
                })}
              />
              {!!formState.errors.title && (
                <FormFeedback type="invalid">
                  {formState.errors.title.message}
                </FormFeedback>
              )}
            </div>
          </Col>

          <Col>
            <div>
              <Label className="form-label" htmlFor="product-slug">
                Slug
              </Label>
              <Input
                type="text"
                className="form-control"
                id="product-slug"
                placeholder="Slug"
                invalid={!!formState.errors.slug}
                {...register('slug', {
                  onBlur: (event) => {
                    debounceValidateSlug.cancel();
                    validateSlug(event.target.value);
                  },
                })}
              />
              {!!formState.errors.slug && (
                <FormFeedback type="invalid">
                  {formState.errors.slug.message}
                </FormFeedback>
              )}
            </div>
          </Col>
        </Row>

        <div className="mb-4">
          <Label className="form-label">Descrição do produto</Label>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <CKEditor
                // @ts-ignore
                editor={ClassicEditor}
                data={field.value}
                onChange={(_, editor: any) => {
                  field.onChange(editor.getData());
                }}
              />
            )}
          />
          {!!formState.errors.description && (
            <FormFeedback type="invalid">
              {formState.errors.description.message}
            </FormFeedback>
          )}
        </div>

        <Row>
          <Col>
            <Card className="border border-1 rounded shadow-none">
              <Card.Header>
                <h4 className="mb-0">Breve descrição do produto</h4>
              </Card.Header>
              <Card.Body>
                <small
                  className="d-block fs-5 mb-4"
                  style={{
                    color: '#9599AD',
                  }}
                >
                  Adicione uma breve descrição para o produto
                </small>

                <textarea
                  className={clsx('form-control', {
                    'is-invalid': !!formState.errors.shortDescription,
                  })}
                  id="validationTextarea"
                  placeholder="A descrição deve conter no mínimo 100 caracteres."
                  rows={4}
                  {...register('shortDescription')}
                />
                {!!formState.errors.shortDescription && (
                  <FormFeedback type="invalid">
                    {formState.errors.shortDescription.message}
                  </FormFeedback>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col>
            <Row className="mb-4">
              <Col>
                <div>
                  <Label className="form-label" htmlFor="type">
                    Tipo de grupo
                  </Label>
                  <select
                    className={clsx('form-select', {
                      'is-invalid': !!formState.errors.stockStatus,
                    })}
                    aria-label="Tipo de produtos"
                    id="type"
                    {...register('groupType', {
                      onChange(event) {
                        if (
                          ['grouped', 'kit'].includes(event.target.value) &&
                          fields.length === 0
                        ) {
                          append({});
                        }

                        if (['simple'].includes(event.target.value)) {
                          remove();
                        }
                      },
                    })}
                  >
                    <option value="simple">Simples</option>
                    <option value="grouped">Agrupado</option>
                    <option value="kit">Kit</option>
                  </select>

                  {!!formState.errors.groupType && (
                    <FormFeedback type="invalid">
                      {formState.errors.groupType.message}
                    </FormFeedback>
                  )}
                </div>
              </Col>

              <Col>
                <div>
                  <Label className="form-label" htmlFor="SKU">
                    SKU
                  </Label>

                  <Input
                    type="text"
                    className="form-control"
                    id="SKU"
                    placeholder="100"
                    invalid={!!formState.errors.sku}
                    {...register('sku')}
                  />

                  {!!formState.errors.sku && (
                    <FormFeedback type="invalid">
                      {formState.errors.sku.message}
                    </FormFeedback>
                  )}
                </div>
              </Col>
            </Row>
            <div>
              <Label className="form-label" htmlFor="productType">
                Tipo de produto
              </Label>
              <select
                className={clsx('form-select', {
                  'is-invalid': !!formState.errors.stockStatus,
                })}
                aria-label="Tipo de produtos"
                id="productType"
                {...register('productType')}
              >
                <option value="physical">Fisico</option>
                <option value="digital">Digital</option>
              </select>

              {!!formState.errors.productType && (
                <FormFeedback type="invalid">
                  {formState.errors.productType.message}
                </FormFeedback>
              )}
            </div>

            <Row className="mt-4">
              <Col>
                <div className="form-check mb-2">
                  <Input
                    className="form-check-input"
                    type="checkbox"
                    id="featured"
                    {...register('featured', {
                      setValueAs(value) {
                        return value === 'on';
                      },
                    })}
                  />
                  <Label
                    className="form-check-label fw-normal"
                    htmlFor="featured"
                  >
                    Exibir tag de destaque
                  </Label>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
