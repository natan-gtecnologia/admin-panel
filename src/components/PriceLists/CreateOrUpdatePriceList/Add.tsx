/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import debounce from 'lodash/debounce';
import Image from 'next/image';
import qs from 'qs';
import { ChangeEvent, useCallback, useState } from 'react';
import { UseFieldArrayRemove, useFormContext } from 'react-hook-form';
import {
  Button,
  Col,
  FormFeedback,
  Label,
  Modal,
  Row,
  Spinner,
} from 'reactstrap';

import { IProduct } from '../../../@types/product';
import { api } from '../../../services/apiClient';
import { convert_product_strapi } from '../../../utils/convertions/convert_product';
import { currencyMask } from '../../../utils/masks';
import { CreateOrUpdatePriceListSchema } from './schema';

interface Props {
  fieldIndex: number;
  onRemove: UseFieldArrayRemove;
}

export function Add({ fieldIndex, onRemove }: Props) {
  const { register, formState, setValue, watch } =
    useFormContext<CreateOrUpdatePriceListSchema>();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [productTitle, setProductTitle] = useState('');
  // @ts-ignore
  const productTitleEdit = watch(`productPrices.${fieldIndex}.title`);

  const title =
    productTitleEdit && !productTitle
      ? String(productTitleEdit).trim()
      : productTitle;

  const {
    data: products,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        if (!search) return [];

        const response = await api.get('/products', {
          params: {
            publicationState: 'preview',
            filters: {
              $or: [
                {
                  title: {
                    $containsi: search,
                  },
                },
                {
                  description: {
                    $containsi: search,
                  },
                },
              ],
            },
          },
          paramsSerializer: (params) => qs.stringify(params),
        });

        return response.data.data.map(convert_product_strapi) as IProduct[];
      } catch (error) {
        return [];
      }
    },
    initialData: [],
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
  });

  const handleSearch = async (search: string) => {
    setSearch(search);

    if (search) {
      refetch();
    }
  };

  const onToggle = () => {
    const newOpen = !open;
    setOpen(newOpen);

    if (newOpen) {
      refetch();
    }
  };

  const onToggleSelectProduct = (id: number) => {
    setSelectedId((oldProducts) => {
      if (oldProducts === id) {
        return null;
      }

      return id;
    });
  };

  const handleDiscardModal = () => {
    setOpen(false);
    setSelectedId(null);
    setSearch('');
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _handleSearch = useCallback(
    debounce((search: string) => handleSearch(search), 500),
    [],
  );

  const handleAdd = () => {
    if (selectedId === null) {
      return;
    }

    const product = products.find((prod) => prod.id === selectedId);

    if (!product) return;

    setProductTitle(product?.title || '');
    setValue(`productPrices.${fieldIndex}.product`, product.id);
    setValue(
      `productPrices.${fieldIndex}.price.regularPrice`,
      currencyMask.maskDefault(product.price?.regularPrice || 0),
    );
    setValue(
      `productPrices.${fieldIndex}.price.salePrice`,
      currencyMask.maskDefault(product.price?.salePrice || 0),
    );

    handleDiscardModal();
  };

  return (
    <div
      className={clsx('p-2 border rounded', {
        'mt-4': fieldIndex > 0,
      })}
    >
      <Row className="mt-2 align-items-end">
        <Col>
          <Label htmlFor="prod.item">Produto</Label>
          <div className="search-box search-box-sm">
            <Input
              type="text"
              className="form-control"
              placeholder="Pesquisar produtos"
              value={title}
              disabled
            />
            <i className="ri-search-line search-icon"></i>
          </div>
        </Col>

        <Col
          style={{
            maxWidth: 'calc(144px + calc(var(--vz-gutter-x) * 0.5))',
          }}
          className="d-flex gap-2"
        >
          <Button
            color="secondary"
            outline
            className="shadow-none"
            onClick={onToggle}
          >
            Buscar
          </Button>

          <Button color="danger" onClick={() => onRemove(fieldIndex)}>
            <i className="ri-delete-bin-2-line"></i>
          </Button>
        </Col>

        <Modal isOpen={open} toggle={onToggle} centered>
          <Card className="m-0 shadow-none">
            <Card.Header>
              <h4 className="mb-0">Adicionar produtos</h4>
            </Card.Header>

            <div className="p-3 border-bottom border-1">
              <div className="search-box search-box-sm">
                <Input
                  type="text"
                  className="form-control"
                  placeholder="Pesquisar produtos "
                  value={search}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setSearch(e.target.value);
                    _handleSearch(e.target.value);
                  }}
                />
                <i className="ri-search-line search-icon"></i>
              </div>
            </div>

            {isFetching && (
              <div className="p-3 d-flex aling-items-center justify-content-center">
                <Spinner />
              </div>
            )}

            {!isFetching &&
              products.map((product) => (
                <div
                  key={product.id}
                  className={clsx(`p-3 d-flex align-items-center gap-2`, {
                    [`border-top border-1`]: false,
                  })}
                >
                  <label
                    className="d-flex align-items-center gap-3 cursor-pointer"
                    style={{
                      width: '100%',
                    }}
                  >
                    <input
                      type="checkbox"
                      className="productCheckBox form-check-input"
                      value={product.id}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        onToggleSelectProduct(Number(e.target.value));
                      }}
                      checked={selectedId === product.id}
                    />

                    {product.images.data?.length > 0 && (
                      <Image
                        src={
                          product.images.data[0].attributes?.formats?.thumbnail
                            ?.url || product.images.data[0].attributes?.url
                        }
                        alt=""
                        className="rounded overflow-hidden"
                        width={40}
                        height={40}
                        objectFit="cover"
                        objectPosition="center"
                      />
                    )}

                    <div>
                      <h6 className="m-0 fw-normal">{product.title}</h6>
                      <small
                        className="d-block text-muted fs-6 fw-normal"
                        style={{
                          marginTop: 2,
                        }}
                      >
                        Quantidade disponível: {product.stockQuantity}
                      </small>
                    </div>
                  </label>
                </div>
              ))}

            <div className="p-3 border-top border-1 d-flex align-items-center justify-content-end gap-2">
              <Button color="danger" type="button" onClick={handleDiscardModal}>
                Cancelar
              </Button>
              <Button color="success" type="button" onClick={handleAdd}>
                Pronto
              </Button>
            </div>
          </Card>
        </Modal>
      </Row>
      {formState.errors.productPrices?.[fieldIndex]?.product?.message && (
        <FormFeedback type="invalid" className="d-block">
          {formState.errors.productPrices?.[fieldIndex]?.product?.message}
        </FormFeedback>
      )}

      <Row className="mt-2 mb-2 align-items-end">
        <Col>
          <div>
            <Label htmlFor={`productPrices.${fieldIndex}.price.regularPrice`}>
              Preço Regular
            </Label>
            <div className="form-icon">
              <Input
                id={`productPrices.${fieldIndex}.price.regularPrice`}
                className="form-control form-control-icon"
                placeholder="10"
                invalid={
                  !!formState.errors.productPrices?.[fieldIndex]?.price
                    ?.regularPrice
                }
                {...register(`productPrices.${fieldIndex}.price.regularPrice`, {
                  onChange: currencyMask.onChange,
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

            {formState.errors.productPrices?.[fieldIndex]?.price?.regularPrice
              ?.message && (
              <FormFeedback type="invalid" className="d-block">
                {formState.errors.productPrices?.[
                  fieldIndex
                ].price?.regularPrice?.message.toString()}
              </FormFeedback>
            )}
          </div>
        </Col>

        <Col>
          <div>
            <Label htmlFor={`productPrices.${fieldIndex}.price.salePrice`}>
              Preço de Venda
            </Label>
            <div className="form-icon">
              <Input
                id={`productPrices.${fieldIndex}.price.salePrice`}
                className="form-control form-control-icon"
                placeholder="10"
                invalid={
                  !!formState.errors.productPrices?.[fieldIndex]?.price
                    ?.salePrice
                }
                {...register(`productPrices.${fieldIndex}.price.salePrice`, {
                  onChange: currencyMask.onChange,
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
            {formState.errors.productPrices?.[fieldIndex]?.price?.salePrice
              ?.message && (
              <FormFeedback type="invalid" className="d-block">
                {formState.errors.productPrices?.[
                  fieldIndex
                ].price?.salePrice?.message.toString()}
              </FormFeedback>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}
