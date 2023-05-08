/* eslint-disable @next/next/no-img-element */
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
import { useFormContext } from 'react-hook-form';
import { CreateOrEditProductSchemaProps } from './schema';

export function ProductStock() {
  const { formState, register } =
    useFormContext<CreateOrEditProductSchemaProps>();

  return (
    <Card className="shadow-none">
      <Card.Body>
        <Row>
          <Col>
            <div>
              <Label className="form-label" htmlFor="stockStatus">
                Status do estoque
              </Label>
              <select
                className={clsx('form-select', {
                  'is-invalid': !!formState.errors.stockStatus,
                })}
                aria-label="Estoque status"
                id="stockStatus"
                {...register('stockStatus')}
              >
                <option value="in_stock">Em estoque</option>
                <option value="out_of_stock">Fora de estoque</option>
                <option value="on_back_order">Em espera</option>
              </select>
              {!!formState.errors.stockStatus && (
                <FormFeedback type="invalid">
                  {formState.errors.stockStatus.message}
                </FormFeedback>
              )}
            </div>
          </Col>

          <Col>
            <div>
              <Label className="form-label" htmlFor="stockQuantity">
                Quantidade em estoque
              </Label>
              <Input
                type="number"
                id="stockQuantity"
                placeholder="28"
                min={0}
                step={1}
                invalid={!!formState.errors.stockQuantity}
                {...register('stockQuantity', {
                  valueAsNumber: true,
                })}
              />
              {!!formState.errors.stockQuantity && (
                <FormFeedback type="invalid">
                  {formState.errors.stockQuantity.message}
                </FormFeedback>
              )}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
