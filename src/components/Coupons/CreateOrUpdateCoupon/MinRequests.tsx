import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Label } from 'reactstrap';
import { CreateOrUpdateCouponSchemaProps } from './schema';

export function MinRequests() {
  const { register, formState, setValue } =
    useFormContext<CreateOrUpdateCouponSchemaProps>();
  const [min, setMin] = useState('0');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMin(e.target.value);

    setValue('minimumCartAmount', null);
    setValue('minimumProductQuantity', null);
  };

  return (
    <Card className="shadow-none">
      <Card.Body>
        <h4 className="fs-5 text-body mb-3">Requisitos mínimos de compra</h4>

        <div>
          <div className="form-check mb-2">
            <Input
              className="form-check-input"
              type="radio"
              name="minRequests"
              id="minRequests1"
              onChange={handleChange}
              value="0"
              checked={min === '0'}
            />
            <Label className="form-check-label" htmlFor="minRequests1">
              Sem requisitos mínimos
            </Label>
          </div>
          <div className="form-check mb-2">
            <Input
              className="form-check-input"
              type="radio"
              name="minRequests"
              id="minRequests2"
              onChange={handleChange}
              value="1"
              checked={min === '1'}
            />
            <Label className="form-check-label" htmlFor="minRequests2">
              Valor mínimo de compra (R$)
            </Label>
          </div>
          {min === '1' && (
            <div className="mt-2 mb-2 ps-3">
              <div
                className="form-icon"
                style={{
                  maxWidth: 224,
                }}
              >
                <Input
                  className="form-control form-control-icon"
                  type="number"
                  placeholder="10"
                  step={1}
                  invalid={!!formState.errors.minimumCartAmount}
                  {...register('minimumCartAmount', {
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
            </div>
          )}

          <div className="form-check mb-2">
            <Input
              className="form-check-input"
              type="radio"
              name="minRequests"
              id="minRequests3"
              onChange={handleChange}
              value="2"
              checked={min === '2'}
            />
            <Label className="form-check-label" htmlFor="minRequests3">
              Quantidade mínima de itens
            </Label>
          </div>
          {min === '2' && (
            <div className="mt-2 ps-3">
              <Input
                className="form-control form-control-icon"
                type="number"
                placeholder="10"
                step={1}
                invalid={!!formState.errors.minimumProductQuantity}
                {...register('minimumProductQuantity', {
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
