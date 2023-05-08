import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Label } from 'reactstrap';
import { CreateOrUpdateCouponSchemaProps } from './schema';

export function CouponRules() {
  const { register, formState, setValue } =
    useFormContext<CreateOrUpdateCouponSchemaProps>();
  const [min, setMin] = useState('0');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMin(e.target.value);

    if (e.target.value === '1') {
      setValue('accumulatedDiscountLimit', 0);
    }
  };

  return (
    <Card className="shadow-none">
      <Card.Body>
        <h4 className="fs-5 text-body mb-3">Regra de cupom</h4>

        <div>
          <div className="form-check mb-2">
            <Input
              className="form-check-input"
              type="radio"
              name="couponRules"
              id="couponRules1"
              onChange={handleChange}
              value="0"
              invalid={!!formState.errors.maximumUseQuantity}
              checked={min === '0'}
            />
            <Label className="form-check-label" htmlFor="couponRules1">
              Cumulativo
            </Label>
          </div>
          {min === '0' && (
            <div className="mt-2 mb-2 ps-3">
              <Input
                className="form-control form-control-icon"
                type="number"
                placeholder="10"
                step={1}
                invalid={!!formState.errors.accumulatedDiscountLimit}
                {...register('accumulatedDiscountLimit', {
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

          <div className="form-check">
            <Input
              className="form-check-input"
              type="radio"
              name="couponRules"
              id="couponRules2"
              onChange={handleChange}
              invalid={!!formState.errors.maximumUseQuantity}
              value="1"
              checked={min === '1'}
            />
            <Label className="form-check-label" htmlFor="couponRules2">
              Não cumulativo
            </Label>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
