import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Label } from 'reactstrap';
import { CreateOrUpdateCouponSchemaProps } from './schema';

export function MaxUse() {
  const { register, formState, setValue } =
    useFormContext<CreateOrUpdateCouponSchemaProps>();
  const [min, setMin] = useState('0');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMin(e.target.value);

    if (e.target.value === '0') {
      setValue('maximumUseQuantity', 1);
    }
  };

  return (
    <Card className="shadow-none">
      <Card.Body>
        <h4 className="fs-5 text-body mb-3">Usos máximos de desconto</h4>

        <div>
          <div className="form-check mb-2">
            <Input
              className="form-check-input"
              type="radio"
              name="maxUse"
              id="maxUse1"
              onChange={handleChange}
              value="0"
              checked={min === '0'}
            />
            <Label className="form-check-label" htmlFor="maxUse1">
              Limite à uma utilização por cliente
            </Label>
          </div>
          <div className="form-check">
            <Input
              className="form-check-input"
              type="radio"
              name="maxUse"
              id="maxUse2"
              onChange={handleChange}
              value="1"
              checked={min === '1'}
            />
            <Label className="form-check-label" htmlFor="maxUse2">
              Número de vezes que este desconto pode ser usado no total
            </Label>
          </div>
          {min === '1' && (
            <div className="mt-2 mb-2 ps-3">
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
