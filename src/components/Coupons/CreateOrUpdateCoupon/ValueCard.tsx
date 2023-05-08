import { faPercent } from '@fortawesome/pro-solid-svg-icons/faPercent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import { useFormContext } from 'react-hook-form';
import { Button, ButtonGroup, Col, FormFeedback, Row } from 'reactstrap';
import { CreateOrUpdateCouponSchemaProps } from './schema';

export function ValueCard() {
  const { watch, setValue, formState, register } =
    useFormContext<CreateOrUpdateCouponSchemaProps>();
  const type = watch('discountType');

  return (
    <Card className="shadow-none">
      <Card.Body>
        <h4 className="fs-5 text-body mb-3">Valor</h4>

        <div>
          <Row>
            <Col
              style={{
                maxWidth: '240px',
              }}
            >
              <ButtonGroup>
                <Button
                  type="button"
                  onClick={() => setValue('discountType', 'percentage')}
                  active={type === 'percentage'}
                >
                  Percentagem
                </Button>
                <Button
                  type="button"
                  onClick={() => setValue('discountType', 'price')}
                  active={type === 'price'}
                >
                  Quantia fixa
                </Button>
              </ButtonGroup>
            </Col>
            <Col>
              {type === 'percentage' && (
                <div className="form-icon right">
                  <Input
                    className="form-control form-control-icon"
                    type="number"
                    placeholder="10"
                    step={0.01}
                    max={100}
                    invalid={!!formState.errors.discount}
                    {...register('discount', {
                      min: 0,
                      shouldUnregister: true,
                      valueAsNumber: true,
                    })}
                  />
                  <i className="text-muted">
                    <FontAwesomeIcon icon={faPercent} />
                  </i>
                </div>
              )}

              {type === 'price' && (
                <div className="form-icon">
                  <Input
                    className="form-control form-control-icon"
                    type="number"
                    placeholder="10"
                    step={0.01}
                    invalid={!!formState.errors.discount}
                    {...register('discount', {
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
              )}
            </Col>
          </Row>

          {formState.errors.discount && (
            <FormFeedback type="invalid">
              {formState.errors.discount.message}
            </FormFeedback>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
