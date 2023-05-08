/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import { Tabs } from '@growth/growforce-admin-ui/components/Common/Tabs';
import {
  Button,
  Col,
  FormFeedback,
  InputGroup,
  InputGroupText,
  Label,
  Row,
} from '@growth/growforce-admin-ui/index';
import 'cleave.js/dist/addons/cleave-phone.in';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { MetaData } from '../../MetaData';
import { CreateOrEditProductSchemaProps } from './schema';

import { useMemo } from 'react';
import { currencyMask } from '../../../utils/masks';

export function ProductOptions() {
  const { control, formState, register, watch } =
    useFormContext<CreateOrEditProductSchemaProps>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'metaData',
  });
  const productType = watch('productType');

  const hasErrorOnDimensions = useMemo(() => {
    return productType === 'physical' && !!formState.errors.dimension;
  }, [productType, formState.errors.dimension]);

  return (
    <Card className="shadow-none">
      <Tabs
        dataTabs={[
          {
            title: 'Informações',
            content: (
              <Card.Body>
                {/*<div className="mb-3">
                  <Label className="form-label" htmlFor="manufacturer">
                    Nome do fabricante
                  </Label>
                  <Input
                    type="text"
                    id="manufacturer"
                    placeholder="Nome do fabricante"
                    invalid={!!formState.errors.manufacturer}
                    {...register('manufacturer')}
                  />
                  {!!formState.errors.manufacturer && (
                    <FormFeedback type="invalid">
                      {String(formState.errors.manufacturer.message)}
                    </FormFeedback>
                  )}
                </div>*/}

                <Row>
                  <Col>
                    <div>
                      <label
                        htmlFor="price.regularPrice"
                        className="form-label"
                      >
                        Preço regular
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">R$</span>
                        <Input
                          id="price.regularPrice"
                          placeholder="20"
                          invalid={!!formState.errors.price?.regularPrice}
                          {...register('price.regularPrice', {
                            onChange: currencyMask.onChange,
                          })}
                        />
                      </div>
                      {!!formState.errors.price?.regularPrice && (
                        <FormFeedback type="invalid" className="d-block">
                          {String(formState.errors.price?.regularPrice.message)}
                        </FormFeedback>
                      )}
                    </div>
                  </Col>

                  <Col>
                    <div>
                      <label htmlFor="price.salePrice" className="form-label">
                        Preço de venda
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">R$</span>
                        <Input
                          id="price.salePrice"
                          placeholder="20"
                          invalid={!!formState.errors.price?.salePrice}
                          {...register('price.salePrice', {
                            onChange: currencyMask.onChange,
                          })}
                        />
                      </div>
                      {!!formState.errors.price?.salePrice && (
                        <FormFeedback type="invalid" className="d-block">
                          {String(formState.errors.price.salePrice.message)}
                        </FormFeedback>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            ),
            id: 'informations',
          },
          {
            title: 'Dimensões',
            content: (
              <Card.Body>
                <Row
                  style={{
                    rowGap: 13,
                  }}
                >
                  <Col lg={6}>
                    <div>
                      <Label className="form-label" htmlFor="dimension.width">
                        Largura
                      </Label>
                      <InputGroup>
                        <Input
                          id="dimension.width"
                          placeholder="20"
                          invalid={!!formState.errors.dimension?.width}
                          {...register('dimension.width', {
                            onChange: currencyMask.onChange,
                          })}
                        />
                        <InputGroupText>cm</InputGroupText>
                      </InputGroup>
                      {!!formState.errors.dimension?.width && (
                        <FormFeedback type="invalid" className="d-block">
                          {String(formState?.errors?.dimension?.width?.message)}
                        </FormFeedback>
                      )}
                    </div>
                  </Col>

                  <Col lg={6}>
                    <div>
                      <Label className="form-label" htmlFor="dimension.height">
                        Altura
                      </Label>
                      <InputGroup>
                        <Input
                          id="dimension.height"
                          placeholder="20"
                          invalid={!!formState.errors.dimension?.height}
                          {...register('dimension.height', {
                            onChange: currencyMask.onChange,
                          })}
                        />
                        <InputGroupText>cm</InputGroupText>
                      </InputGroup>
                      {!!formState.errors.dimension?.height && (
                        <FormFeedback type="invalid" className="d-block">
                          {String(formState.errors.dimension?.height.message)}
                        </FormFeedback>
                      )}
                    </div>
                  </Col>

                  <Col lg={6}>
                    <div>
                      <Label className="form-label" htmlFor="dimension.length">
                        Comprimento
                      </Label>
                      <InputGroup>
                        <Input
                          id="dimension.length"
                          placeholder="20"
                          invalid={!!formState.errors.dimension?.length}
                          {...register('dimension.length', {
                            onChange: currencyMask.onChange,
                          })}
                        />
                        <InputGroupText>cm</InputGroupText>
                      </InputGroup>
                      {!!formState.errors.dimension?.length && (
                        <FormFeedback type="invalid" className="d-block">
                          {String(formState.errors.dimension?.length.message)}
                        </FormFeedback>
                      )}
                    </div>
                  </Col>

                  <Col lg={6}>
                    <div>
                      <Label className="form-label" htmlFor="dimension.weight">
                        Peso bruto
                      </Label>
                      <InputGroup>
                        <Input
                          id="dimension.weight"
                          placeholder="20"
                          invalid={!!formState.errors.dimension?.weight}
                          {...register('dimension.weight', {
                            onChange: currencyMask.onChange,
                          })}
                        />
                        <InputGroupText>g</InputGroupText>
                      </InputGroup>

                      {!!formState.errors.dimension?.weight && (
                        <FormFeedback type="invalid" className="d-block">
                          {String(formState.errors.dimension?.weight.message)}
                        </FormFeedback>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            ),
            id: 'dimensions',
          },
          {
            title: 'Meta Data',
            content: (
              <>
                <Button
                  onClick={() =>
                    append({
                      key: '',
                      valueBigInteger: 0,
                      valueBoolean: false,
                      valueDecimal: 0,
                      valueString: '',
                      valueFloat: 0,
                      valueInteger: 0,
                      valueJson: null,
                    })
                  }
                >
                  Adicionar meta
                </Button>
                {fields.map((item, index) => (
                  <Card.Body key={item.id}>
                    <MetaData indexKey={index} onRemove={remove} />
                  </Card.Body>
                ))}
              </>
            ),
            id: 'metaData',
          },
        ].filter((tab) => {
          if (productType === 'digital' && tab.id === 'dimensions') {
            return false;
          }

          return true;
        })}
        tabs
        className="nav-tabs-custom card-header-tabs border-bottom-1 nav m-0"
        currentTab={hasErrorOnDimensions ? 'dimensions' : undefined}
      />
    </Card>
  );
}
