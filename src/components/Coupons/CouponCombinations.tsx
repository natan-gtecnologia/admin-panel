import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import { Controller, useFormContext } from 'react-hook-form';
import { Label } from 'reactstrap';
import { CreateOrUpdateCouponSchemaProps } from './CreateOrUpdateCoupon/schema';

export function CouponCombinations() {
  const { control } = useFormContext<CreateOrUpdateCouponSchemaProps>();

  return (
    <Card className="shadow-none">
      <Card.Body>
        <h4 className="fs-5 text-body m-0">Combinações</h4>
        <p className="mb-3 mt-3">
          Este cupom de desconto pode ser combinado com:
        </p>

        <div className="form-check mb-2">
          <Controller
            control={control}
            name="accumulative"
            render={({ field }) => (
              <Input
                className="form-check-input"
                type="checkbox"
                id="otherCoupons"
                onChange={(e) => field.onChange(e.target.checked)}
                checked={field.value}
              />
            )}
          />
          <Label className="form-check-label fw-normal" htmlFor="otherCoupons">
            Outros descontos de produto
          </Label>
        </div>
      </Card.Body>
    </Card>
  );
}
