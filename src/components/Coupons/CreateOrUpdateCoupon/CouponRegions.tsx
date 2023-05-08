import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Col, FormFeedback, Label, Row } from 'reactstrap';

import { regions } from '../../../utils/regions';
import { CreateOrUpdateCouponSchemaProps } from './schema';

function findRegion(
  initialCepRange: string,
  finalCepRange: string,
): string | undefined {
  const region = Object.keys(regions).find((region: keyof typeof regions) => {
    const cepRange = regions[region];

    return (
      cepRange.initialCepRange === initialCepRange &&
      cepRange.finalCepRange === finalCepRange
    );
  });

  const returnRegion = regions[region];

  if (!returnRegion) {
    return '';
  }

  return region;
}

export function CouponRegions() {
  const { register, formState, setValue, watch, clearErrors } =
    useFormContext<CreateOrUpdateCouponSchemaProps>();
  const initialCepRange = watch('initialCepRange');
  const finalCepRange = watch('finalCepRange');
  const type = watch('type');
  const [min, setMin] = useState(
    (initialCepRange === '' && finalCepRange === '') ||
      (initialCepRange === null && finalCepRange === null)
      ? '0'
      : '1',
  );
  const [region, setRegion] = useState(
    initialCepRange === '' && finalCepRange === ''
      ? ''
      : findRegion(initialCepRange, finalCepRange),
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMin(e.target.value);

    if (e.target.value === '0') {
      setValue('initialCepRange', '');
      setValue('finalCepRange', '');
      setValue('type', 'all_store');
    }

    if (e.target.value === '1') {
      setValue('type', 'free_shipping_by_region');
    }
  };

  return (
    <Card className="shadow-none">
      <Card.Header>
        <h4 className="fs-5 text-body mb-3">Regiões</h4>

        <div className="form-check mb-2">
          <Input
            className="form-check-input"
            type="radio"
            name="cepRegion"
            id="cepRegion1"
            onChange={handleChange}
            value="0"
            checked={min === '0'}
          />
          <Label className="form-check-label" htmlFor="cepRegion1">
            Todas as regiões
          </Label>
        </div>

        <div className="form-check mb-2">
          <Input
            className="form-check-input"
            type="radio"
            name="cepRegion"
            id="cepRegion2"
            onChange={handleChange}
            value="1"
            checked={min === '1'}
          />
          <Label className="form-check-label" htmlFor="cepRegion2">
            Regiões selecionadas
          </Label>
        </div>

        {type === 'free_shipping_by_region' && (
          <Row>
            <Col>
              <div className="search-box search-box-sm">
                <Input
                  type="text"
                  placeholder="Pesquisar regiões"
                  list="regions-suggestions"
                  autoComplete="off"
                  value={region}
                  onChange={(e) => {
                    setRegion(e.target.value);
                    setMin('1');

                    if (e.target.value === '') return;

                    const region =
                      regions[e.target.value as keyof typeof regions];
                    if (!region) return;
                    setValue('type', 'free_shipping_by_region');
                    setValue('initialCepRange', region.initialCepRange);
                    setValue('finalCepRange', region.finalCepRange);
                    clearErrors('initialCepRange');
                  }}
                />
                <datalist id="regions-suggestions">
                  {Object.keys(regions).map((region) => (
                    <option
                      onClick={() => {
                        setRegion(region);
                        setMin('1');
                      }}
                      key={region}
                      value={region}
                    >
                      {region}
                    </option>
                  ))}
                </datalist>
                <i className="ri-search-line search-icon"></i>
              </div>
              {formState.errors.initialCepRange && (
                <FormFeedback type="invalid" className="d-block">
                  {formState.errors.initialCepRange?.message}
                </FormFeedback>
              )}
            </Col>
          </Row>
        )}
      </Card.Header>
      <Card.Body>
        <h5 className="fs-6 text-body mb-3">Taxas de frete</h5>

        <div className="form-check">
          <Input
            className="form-check-input"
            type="checkbox"
            id="exclude"
            value="exclude"
            onClick={(e) => {
              if (e.target.checked) {
                setValue('shippingType', 'to_shipping');
              } else {
                setValue('shippingType', 'free_shipping');
              }
            }}
          />
          <Label className="form-check-label" htmlFor="exclude">
            Excluir taxas de frete maiores que uma certa quantia
          </Label>
        </div>
        <div className="mt-2 ps-3">
          <Input
            className="form-control form-control-icon"
            type="number"
            placeholder="10"
            min={0}
            step={1}
            style={{
              maxWidth: 224,
            }}
            {...register('shippingDiscount', {
              valueAsNumber: true,
            })}
            invalid={!!formState.errors.shippingDiscount}
          />
          <FormFeedback type="invalid">
            {formState.errors.shippingDiscount?.message}
          </FormFeedback>
        </div>
      </Card.Body>
      <Card.Body></Card.Body>
    </Card>
  );
}
