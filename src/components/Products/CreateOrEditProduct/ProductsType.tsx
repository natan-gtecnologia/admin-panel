import { Button } from '@growth/growforce-admin-ui/components/Common/Button';
import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import { Col, Label, Row } from '@growth/growforce-admin-ui/index';

import clsx from 'clsx';
import QueryString from 'qs';
import { useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { CreateOrEditProductSchemaProps } from './schema';

import { IProduct } from '../../../@types/product';
import { api } from '../../../services/apiClient';
import { convert_product_strapi } from '../../../utils/convertions/convert_product';

export function ProductsType() {
  const { control } = useFormContext<CreateOrEditProductSchemaProps>();
  const { fields, append, update } = useFieldArray({
    control,
    name: 'groupedProducts',
  });
  const [productId, setProductId] = useState(0);
  const [productQuantity, setProductQuantity] = useState(0);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [editing, setEditing] = useState(-1);

  function handleAddProduct() {
    if (editing > -1) {
      update(editing, {
        product: productId,
        quantity: productQuantity,
      });
    } else {
      append({
        product: productId,
        quantity: productQuantity,
      });
    }

    setProductId(0);
    setProductQuantity(0);
  }

  function handleSetEditing(index: number) {
    setProductId(fields[index].product);
    setProductQuantity(fields[index].quantity);
    setEditing(index);
  }

  useEffect(() => {
    async function fetch() {
      const DEFAULT_PARAMS = {
        populate: '*',
        publicationState: 'preview',
        pagination: {
          pageSize: 100,
        },
      };

      const productsResponse = await api.get('/products', {
        params: DEFAULT_PARAMS,
        paramsSerializer: (params) => {
          return QueryString.stringify(params);
        },
      });

      setProducts(productsResponse.data.data.map(convert_product_strapi) || []);
    }
    fetch();
  }, []);

  return (
    <Card className="shadow-none">
      <Card.Body>
        <h5>Produtos agrupados</h5>
        <Row className="align-items-end">
          <Col lg={8}>
            <div>
              <Label className="form-label" htmlFor={`product`}>
                Produto
              </Label>
              <select
                className={clsx('form-select')}
                aria-label="Produtos"
                id={`product`}
                onChange={(e) => {
                  setProductId(Number(e.target.value));
                }}
                value={productId}
              >
                <option value="">Selecione o produto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title}
                  </option>
                ))}
              </select>
            </div>
          </Col>

          <Col lg={3}>
            <div>
              <Label className="form-label" htmlFor={`productQuantity`}>
                Quantidade
              </Label>
              <Input
                id={`productQuantity`}
                type="number"
                min={0}
                step={1}
                placeholder="100"
                onChange={(e) => {
                  setProductQuantity(Number(e.target.value));
                }}
                value={productQuantity}
              />
            </div>
          </Col>

          <Col lg={1}>
            <Button
              color="primary"
              style={{
                lineHeight: 0,
                width: 41,
                height: 37,
                padding: 0,
              }}
              type="button"
              onClick={handleAddProduct}
            >
              <i className=" bx bx-plus" />
            </Button>
          </Col>
        </Row>

        <div className="d-flex flex-column gap-2 mt-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="d-flex p-3 border border-1 rounded-3 align-items-center justify-content-between gap-2"
            >
              <span>
                {
                  products.find((product) => product.id === field.product)
                    ?.title
                }
              </span>

              <Button
                color="light"
                className="shadow-none"
                onClick={() => handleSetEditing(index)}
              >
                Editar
              </Button>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}
