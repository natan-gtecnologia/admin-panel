import { faPercent } from '@fortawesome/pro-solid-svg-icons/faPercent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import { useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button, ButtonGroup, Col, FormFeedback, Label, Row } from 'reactstrap';

import { IProduct } from '../../../../@types/product';
import { CreateOrUpdateCouponSchemaProps } from '../schema';
import { Add } from './Add';
import { Product } from './Product';

import QueryString from 'qs';
import { IStrapiProduct } from '../../../../@types/strapi';
import { api } from '../../../../services/apiClient';
import { convert_product_strapi } from '../../../../utils/convertions/convert_product';

export function CouponBuyAndEarn() {
  const { formState, setValue, register, watch, control } =
    useFormContext<CreateOrUpdateCouponSchemaProps>();
  const type = watch('discountType');
  const [shouldDefineMaxUse, setShouldDefineMaxUse] = useState(false);
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'buyAndEarnProducts',
  });
  const [selectedBuyProducts, setSelectedBuyProducts] = useState<IProduct[]>(
    [],
  );
  const [selectedEarnProducts, setSelectedEarnProducts] = useState<IProduct[]>(
    [],
  );

  const toggle = () => {
    setShouldDefineMaxUse(!shouldDefineMaxUse);
    setValue('maximumUseQuantity', undefined);
  };

  function handleOnSelectedChange(props: {
    type: 'buyProducts' | 'earnProducts';
    selectedProducts: IProduct[];

    quantity: number;
    selectedIds: number[];
  }) {
    if (props.type === 'buyProducts') {
      setSelectedBuyProducts((old) => {
        const newProducts = old.filter(
          (product) => !props.selectedIds.includes(product.id),
        );

        return [...newProducts, ...props.selectedProducts];
      });

      props.selectedIds.forEach((id) => {
        const index = fields.findIndex(
          (field) => field.buyProducts.product === id,
        );

        if (index === -1) {
          append({
            buyProducts: {
              product: id,
              quantity: props.quantity,
            },
            earnProducts: {
              product: null,
              quantity: null,
            },
          });
        } else {
          update(index, {
            ...fields[index],
            buyProducts: {
              product: id,
              quantity: props.quantity,
            },
          });
        }
      });

      return;
    }

    setSelectedEarnProducts((old) => {
      const newProducts = old.filter(
        (product) => !props.selectedIds.includes(product.id),
      );

      return [...newProducts, ...props.selectedProducts];
    });

    props.selectedIds.forEach((id, productIndex) => {
      const filteredFields = fields.filter(
        (field) => field.earnProducts.product === null,
      );
      const index = fields.findIndex(
        (field) => field.id === filteredFields[productIndex].id,
      );

      if (filteredFields.length > 0 && index > -1) {
        update(index, {
          ...filteredFields[productIndex],
          earnProducts: {
            product: id,
            quantity: props.quantity,
          },
        });
      }
    });

    return;
  }

  const buyProductsIds = fields.map((field) => field.buyProducts.product);
  const earnProductsIds = fields.map((field) => field.earnProducts.product);

  useEffect(() => {
    api
      .get('/products', {
        params: {
          publicationState: 'preview',
          filters: {
            id: {
              $in: [
                ...buyProductsIds.filter((id) => id !== null),
                ...earnProductsIds.filter((id) => id !== null),
              ],
            },
          },
        },
        paramsSerializer: (params) => QueryString.stringify(params),
      })
      .then((response) => {
        const buyProducts = response.data.data.filter(
          (product: IStrapiProduct) => buyProductsIds.includes(product.id),
        );

        const earnProducts = response.data.data.filter(
          (product: IStrapiProduct) => earnProductsIds.includes(product.id),
        );

        setSelectedBuyProducts(buyProducts.map(convert_product_strapi));
        setSelectedEarnProducts(earnProducts.map(convert_product_strapi));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="shadow-none">
      <Card.Body>
        <div>
          <h5 className="fs-5 text-body mb-3">O cliente compra</h5>

          <Add
            type="buyProducts"
            onSelectedProductsChange={handleOnSelectedChange}
          />

          {fields.map((field, index) => {
            if (field.buyProducts.product === null) {
              return null;
            }
            return (
              <Product
                key={field.id}
                borderSize={index === 0 ? 0 : 1}
                product={selectedBuyProducts.find(
                  (product) => product.id === field.buyProducts.product,
                )}
                onRemove={() => {
                  remove(index);
                }}
              />
            );
          })}
        </div>

        <hr className="mb-3 mt-3 border-primary" />

        <div>
          <h5 className="fs-5 text-body mb-0">O cliente recebe</h5>
          <small className="d-block text-muted mb-3">
            Os clientes devem adicionar a quantidade de itens especificada
            abaixo ao carrinho.
          </small>

          <Add
            type="earnProducts"
            onSelectedProductsChange={handleOnSelectedChange}
          />

          {fields.map((field, index) => {
            if (field.earnProducts.product === null) {
              return null;
            }
            return (
              <Product
                key={field.id}
                borderSize={index === 0 ? 0 : 1}
                product={selectedEarnProducts.find(
                  (product) => product.id === field.earnProducts.product,
                )}
                onRemove={() => {
                  update(index, {
                    ...field,
                    earnProducts: {
                      product: null,
                      quantity: null,
                    },
                  });
                }}
              />
            );
          })}
        </div>

        {formState.errors.buyAndEarnProducts?.message && (
          <FormFeedback type="invalid" className="d-block">
            {formState.errors.buyAndEarnProducts.message.toString()}
          </FormFeedback>
        )}

        <div className="mt-3">
          <h4 className="fs-5 text-body mb-2">Valor</h4>

          <div>
            <Row>
              <Col
                style={{
                  maxWidth: '240px',
                }}
              >
                <ButtonGroup>
                  <Button
                    type="button"
                    onClick={() => setValue('discountType', 'percentage')}
                    active={type === 'percentage'}
                  >
                    Percentagem
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setValue('discountType', 'price')}
                    active={type === 'price'}
                  >
                    Quantia fixa
                  </Button>
                </ButtonGroup>
              </Col>
              <Col>
                {type === 'percentage' && (
                  <div className="form-icon right">
                    <Input
                      className="form-control form-control-icon"
                      type="number"
                      placeholder="10"
                      step={0.01}
                      max={100}
                      invalid={!!formState.errors.discount}
                      {...register('discount', {
                        min: 0,
                        shouldUnregister: true,
                        valueAsNumber: true,
                      })}
                    />
                    <i className="text-muted">
                      <FontAwesomeIcon icon={faPercent} />
                    </i>
                  </div>
                )}

                {type === 'price' && (
                  <div className="form-icon">
                    <Input
                      className="form-control form-control-icon"
                      type="number"
                      placeholder="10"
                      step={0.01}
                      invalid={!!formState.errors.discount}
                      {...register('discount', {
                        min: 0,
                        shouldUnregister: true,
                        valueAsNumber: true,
                      })}
                      style={{
                        paddingLeft: '2rem',
                      }}
                    />
                    <i
                      className="text-muted fst-normal"
                      style={{
                        left: 10,
                      }}
                    >
                      R$
                    </i>
                  </div>
                )}
              </Col>
            </Row>

            {formState.errors.discount && (
              <FormFeedback type="invalid">
                {formState.errors.discount.message}
              </FormFeedback>
            )}
          </div>
        </div>

        <div className="mt-3">
          <div className="form-check">
            <Input
              className="form-check-input"
              type="checkbox"
              id="formCheck2"
              onChange={toggle}
              checked={shouldDefineMaxUse}
            />
            <Label className="form-check-label fw-normal" htmlFor="formCheck2">
              Definir um número máximo de usos por pedido
            </Label>
          </div>
          {shouldDefineMaxUse && (
            <div className="mt-2 ps-3">
              <Input
                className="form-control form-control-icon"
                type="number"
                placeholder="10"
                step={1}
                invalid={!!formState.errors.maximumUseQuantity}
                {...register('maximumUseQuantity', {
                  min: 0,
                  shouldUnregister: true,
                  valueAsNumber: true,
                })}
                style={{
                  maxWidth: 224,
                }}
              />
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
