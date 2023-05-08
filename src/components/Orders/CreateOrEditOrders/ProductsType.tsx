import { Button } from '@growth/growforce-admin-ui/components/Common/Button';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import {
  Col,
  FormFeedback,
  Label,
  Row,
} from '@growth/growforce-admin-ui/index';

import clsx from 'clsx';
import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { CreateOrUpdateOrdersSchemaProps } from './schema';

import { useSettings } from 'apps/growforce/admin-panel/contexts/SettingsContext';
import Flatpickr from 'react-flatpickr';
import { IProduct } from '../../../@types/product';
import { flatpickrPt } from '../../../utils/flatpick-pt';
interface IProducts {
  products: IProduct[];
}

export function ProductsType({ products }: IProducts) {
  const { formState, control, setError } =
    useFormContext<CreateOrUpdateOrdersSchemaProps>();
  const { fields, append, update, remove } = useFieldArray({
    control,
    name: 'items.items',
  });
  const { config } = useSettings();
  const [productId, setProductId] = useState(0);
  const [productQuantity, setProductQuantity] = useState(1);
  const [editing, setEditing] = useState(-1);
  const [orderDate, setOrderDate] = useState(null);

  function handleAddProduct() {
    if (productQuantity === 0 || !productId) {
      setError(`items`, {
        type: 'required',
        message:
          'Preencha as informações corretamente, o minimo deve ser 1 item',
      });
      return;
    }

    const findProductSelected = products.find((item) => item.id === productId);

    if (editing > -1) {
      update(editing, {
        product: productId,
        quantity: productQuantity,
        activation_date: orderDate,
        ...findProductSelected,
      });
    } else {
      append({
        product: productId,
        quantity: productQuantity,
        activation_date: orderDate,
        ...findProductSelected,
      });
    }
    setProductId(0);
    setEditing(-1);
    setProductQuantity(1);
    setOrderDate(null);
  }

  function handleSetEditing(index: number) {
    setProductId(fields[index].product);
    setOrderDate(fields[index].activation_date);
    setProductQuantity(fields[index].quantity);
    setEditing(index);
  }

  function handleSetRemove(index: number) {
    remove(index);
  }

  return (
    <>
      <Row className="align-items-end">
        <Col md={5}>
          <Label className="form-label" htmlFor="product">
            Selecione o produto
          </Label>

          <select
            className={clsx('form-select')}
            aria-label="Produtos"
            id="product"
            onChange={(e) => {
              setProductId(Number(e.target.value));
            }}
            value={productId}
          >
            <option value="">Selecione o produto</option>
            {products.map((product) => {
              const produtNotShowAdminPanel = product.metaData.find((item) => item.key === "notShowAdminPanel")
              return (
                <>
                  {!produtNotShowAdminPanel?.valueBoolean && (
                    <option key={product.id} value={product.id}>
                      {product.title}
                    </option>
                  )}
                </>
              )
            })}
          </select>
        </Col>

        {config?.custom_fields['activation_date'] && (
          <Col lg={4}>
            <Label className="form-label" htmlFor="activation_date">
              Selecione a data de ativação
            </Label>
            <div className="position-relative">
              <Flatpickr
                placeholder="Selecione a data"
                className="form-control"
                id="activation_date"
                options={{
                  mode: 'single',
                  dateFormat: 'd/m/Y',
                  locale: flatpickrPt,
                  minDate: 'today',
                }}
                value={orderDate}
                onChange={(date) => setOrderDate(date)}
                style={{
                  paddingRight: '30px',
                }}
              />
              <Button
                close
                color="link"
                className="shadow-none text-danger"
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '10px',
                  transform: 'translateY(-50%)',
                }}
                onClick={() => setOrderDate(null)}
              />
            </div>
          </Col>
        )}

        <Col lg={config?.custom_fields['activation_date'] ? 2 : 4}>
          <div>
            <Label className="form-label" htmlFor={`quantity`}>
              Quantidade
            </Label>
            <Input
              id={`quantity`}
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

        <Col md={config?.custom_fields['activation_date'] ? 1 : 2}>
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
            <i className={editing > -1 ? 'bx bx-check' : 'bx bx-plus'} />
          </Button>
        </Col>
      </Row>

      {formState.errors?.items && (
        <FormFeedback className="d-block mt-2" type="invalid">
          {formState.errors?.items.message}
        </FormFeedback>
      )}

      <div className="d-flex flex-column gap-2 mt-3">
        {fields.map((field, index) => {
          const product = products.find(
            (product) => product.id === field.product,
          );

          return (
            <div
              key={field.id}
              className="d-flex p-3 border border-1 rounded-3 align-items-center justify-content-between gap-3"
            >
              <span>{product?.title}</span>

              {field?.activation_date ? (
                field.activation_date.map((date, key) => {
                  const validDate = !isNaN(new Date(date).getTime());
                  return (
                    <span key={key}>
                      {validDate
                        ? new Date(date).toLocaleDateString()
                        : 'Sem data de ativação definida'}
                    </span>
                  );
                })
              ) : (
                <span>Sem data de ativação</span>
              )}

              <span>{field?.quantity}</span>

              <span>
                {product?.shortDescription === null
                  ? 'Sem descrição'
                  : product?.shortDescription}
              </span>

              <div className="d-flex gap-2">
                <Button
                  color="light"
                  className="shadow-none"
                  onClick={() => handleSetEditing(index)}
                >
                  Editar
                </Button>
                <Button
                  color="danger"
                  className="shadow-none"
                  onClick={() => handleSetRemove(index)}
                >
                  Remover
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
