import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import clsx from 'clsx';
import debounce from 'lodash/debounce';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormFeedback, Label, Row, Col } from 'reactstrap';

import { api } from '../../../services/apiClient';
import { CreateOrUpdateCouponSchemaProps } from './schema';

type Props = {
  title: string;
  description?: string;
  code?: string;
};

export function Header({ title, description, code = '' }: Props) {
  const { register, formState, watch, setError, clearErrors } =
    useFormContext<CreateOrUpdateCouponSchemaProps>();
  const isCode = watch('method') === 'code';
  const enabledBoolean = watch('enabled');

  const _validateCode = useCallback(
    async (newCode: string) => {
      if (newCode === code) {
        clearErrors('code');
        return;
      }
      try {
        const response = await api.get(`/coupons/code/${newCode}`);

        if (response.data.data) {
          setError('code', {
            type: 'pattern',
            message: 'Código de desconto já existe',
          });
        }
      } catch (error) {
        clearErrors('code');
      }
    },
    [clearErrors, code, setError],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const validateCode = useCallback(debounce(_validateCode, 500), [
    _validateCode,
  ]);

  return (
    <Card className="shadow-none">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <h4 className="fs-5 text-body m-0">{title}</h4>

        {description && <p className="m-0 fs-6">{description}</p>}
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <div
              className={clsx({
                'mb-3': isCode,
              })}
            >
              <p className="text-muted">Método</p>
              <div className="form-check mb-2">
                <Input
                  className="form-check-input"
                  type="radio"
                  id="code"
                  invalid={!!formState.errors.method}
                  value="code"
                  {...register('method')}
                />
                <Label className="form-check-label" htmlFor="code">
                  Código de desconto
                </Label>
              </div>

              <div className="form-check ">
                <Input
                  className="form-check-input"
                  type="radio"
                  id="auto"
                  invalid={!!formState.errors.method}
                  value="auto"
                  {...register('method')}
                />
                <Label className="form-check-label" htmlFor="auto">
                  Desconto automático
                </Label>
              </div>
            </div>
          </Col>

          <Col md={6}>
            <Label className="d-block">Coupon está ativo?</Label>
            <Row>
              <Col>
                <div className="form-check mb-2">
                  <Input
                    className="form-check-input"
                    type="checkbox"
                    id="enabled"
                    {...register('enabled', {
                      setValueAs(value) {
                        return value === 'true';
                      },
                    })}
                  />
                  <Label
                    className="form-check-label fw-normal"
                    htmlFor="enabled"
                  >
                    {enabledBoolean === true ? 'Sim' : 'Não'}
                  </Label>
                </div>
              </Col>
            </Row>
            {formState.errors?.enabled && (
              <FormFeedback type="invalid">
                {formState.errors?.enabled.message}
              </FormFeedback>
            )}
          </Col>
        </Row>

        {isCode && (
          <div>
            <Label className="form-label" htmlFor="discount-code">
              Código de desconto
            </Label>
            <Input
              type="text"
              id="discount-code"
              placeholder="Insira o título do produto"
              invalid={!!formState.errors.code}
              {...register('code', {
                onChange: (e) => validateCode(e.target.value),
              })}
            />
            <small className="d-block mt-2 text-muted fs-6">
              Os clientes devem inserir este código no checkout
            </small>
            {!!formState.errors.code && (
              <FormFeedback type="invalid">
                {formState.errors.code.message}
              </FormFeedback>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
