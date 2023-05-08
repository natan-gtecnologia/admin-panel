import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import clsx from 'clsx';
import debounce from 'lodash/debounce';
import Image from 'next/image';
import qs from 'qs';
import { ChangeEvent, useCallback, useState } from 'react';
import { Button, Col, Label, Modal, Row } from 'reactstrap';

import { IProduct } from '../../../../@types/product';
import { api } from '../../../../services/apiClient';
import { convert_product_strapi } from '../../../../utils/convertions/convert_product';

type AddProps = {
  type: 'buyProducts' | 'earnProducts';
  onSelectedProductsChange: (props: {
    type: 'buyProducts' | 'earnProducts';
    selectedProducts: IProduct[];

    quantity: number;
    selectedIds: number[];
  }) => void;
};

export function Add({ onSelectedProductsChange, type }: AddProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [quantity, setQuantity] = useState(0);

  const handleSearch = async (search: string) => {
    api
      .get('/products', {
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
      })
      .then((response) => {
        setProducts(response.data.data.map(convert_product_strapi));
      });
  };

  const onToggle = () => {
    const newOpen = !open;
    setOpen(newOpen);

    if (newOpen) {
      handleSearch(search);
    }
  };

  const onToggleSelectProduct = (id: number) => {
    setSelectedIds((oldProducts) => {
      if (oldProducts.find((prod) => prod === id)) {
        return oldProducts.filter((prod) => prod !== id);
      }

      return [...oldProducts, id];
    });
  };

  const handleDiscardModal = () => {
    setOpen(false);
    setSelectedIds([]);
    setSearch('');
    setQuantity(0);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _handleSearch = useCallback(
    debounce((search: string) => handleSearch(search), 500),
    [],
  );

  const handleAdd = () => {
    if (selectedIds.length === 0) {
      return;
    }

    onSelectedProductsChange({
      type,

      quantity,
      selectedIds,
      selectedProducts: products.filter((prod) =>
        selectedIds.includes(prod.id),
      ),
    });

    handleDiscardModal();
  };

  return (
    <Row className="mt-2 mb-2 align-items-end">
      <Col>
        <Label htmlFor="prod.quantity">Quantidade</Label>
        <Input
          className="form-control form-control-icon"
          type="number"
          placeholder="10"
          min={0}
          step={1}
          id="prod.quantity"
          style={{
            maxWidth: 224,
          }}
          value={quantity}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setQuantity(Number(e.target.value))
          }
        />
      </Col>

      <Col lg={6}>
        <Label htmlFor="prod.item">Qualquer item de</Label>
        <div className="search-box search-box-sm">
          <Input
            type="text"
            className="form-control"
            placeholder="Pesquisar produtos"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
          />
          <i className="ri-search-line search-icon"></i>
        </div>
      </Col>

      <Col lg={2}>
        <Button
          color="secondary"
          outline
          className="shadow-none"
          onClick={onToggle}
        >
          Acessar
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

          {products.map((product) => (
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
                  checked={selectedIds.includes(product.id)}
                />

                {product.images.data?.length > 0 && (
                  <Image
                    src={
                      product.images.data[0].attributes.formats.thumbnail.url
                    }
                    alt=""
                    className="rounded overflow-hidden"
                    width={40}
                    height={40}
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
  );
}
