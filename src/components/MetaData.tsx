import { Button } from '@growth/growforce-admin-ui/components/Common/Button';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import { Controller, useFormContext } from 'react-hook-form';
import { ButtonGroup, Col, FormFeedback, Label, Row } from 'reactstrap';
import CustomEditor from './CustomEditor';

type Props = {
  indexKey: number;
  onRemove: (indexKey: number) => void;
};

export function MetaData({ indexKey, onRemove }: Props) {
  const { formState, register, control, setError, clearErrors, watch } =
    useFormContext();
  const valueBoolean = watch(`metaData.${indexKey}.valueBoolean`);

  return (
    <div>
      <Row className="mb-3">
        <Col>
          <Label>Key</Label>
          <Input
            placeholder="20 cm"
            invalid={!!formState.errors?.metaData?.[indexKey]?.key}
            {...register(`metaData.${indexKey}.key`)}
          />
          {formState.errors?.metaData?.[indexKey]?.key && (
            <FormFeedback type="invalid">
              {formState.errors?.metaData?.[indexKey]?.key.message}
            </FormFeedback>
          )}
        </Col>
        <Col>
          <Label>Valor String</Label>
          <Input
            placeholder="20 cm"
            invalid={!!formState.errors?.metaData?.[indexKey]?.valueString}
            {...register(`metaData.${indexKey}.valueString`)}
          />
          {formState.errors?.metaData?.[indexKey]?.valueString && (
            <FormFeedback type="invalid">
              {formState.errors?.metaData?.[indexKey]?.valueString.message}
            </FormFeedback>
          )}
        </Col>
        <Col>
          <Label>Valor Integer</Label>
          <div className="d-flex justify-content-center align-items-center gap-2">
            <Input
              type="number"
              step={1}
              placeholder="20"
              defaultValue={0}
              invalid={!!formState.errors?.metaData?.[indexKey]?.valueInteger}
              {...register(`metaData.${indexKey}.valueInteger`, {
                valueAsNumber: true,
              })}
            />
            <Button onClick={() => onRemove(indexKey)} close />
          </div>
          {formState.errors?.metaData?.[indexKey]?.valueInteger && (
            <FormFeedback type="invalid">
              {formState.errors?.metaData?.[indexKey]?.valueInteger.message}
            </FormFeedback>
          )}
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Label>Valor Decimal</Label>
          <Input
            type="number"
            step={0.1}
            placeholder="20"
            defaultValue={0}
            invalid={!!formState.errors?.metaData?.[indexKey]?.valueDecimal}
            {...register(`metaData.${indexKey}.valueDecimal`, {
              valueAsNumber: true,
            })}
          />
          {formState.errors?.metaData?.[indexKey]?.valueDecimal && (
            <FormFeedback type="invalid">
              {formState.errors?.metaData?.[indexKey]?.valueDecimal.message}
            </FormFeedback>
          )}
        </Col>
        <Col>
          <Label>Valor Big Integer</Label>
          <Input
            type="number"
            step={1}
            placeholder="20"
            invalid={!!formState.errors?.metaData?.[indexKey]?.valueBigInteger}
            defaultValue={0}
            {...register(`metaData.${indexKey}.valueBigInteger`, {
              valueAsNumber: true,
            })}
          />
          {formState.errors?.metaData?.[indexKey]?.valueBigInteger && (
            <FormFeedback type="invalid">
              {formState.errors?.metaData?.[indexKey]?.valueBigInteger.message}
            </FormFeedback>
          )}
        </Col>
        <Col>
          <Label>Valor Float</Label>
          <Input
            type="number"
            step={0.1}
            placeholder="20"
            invalid={!!formState.errors?.metaData?.[indexKey]?.valueFloat}
            defaultValue={0}
            {...register(`metaData.${indexKey}.valueFloat`, {
              valueAsNumber: true,
            })}
          />
          {formState.errors?.metaData?.[indexKey]?.valueFloat && (
            <FormFeedback type="invalid">
              {formState.errors?.metaData?.[indexKey]?.valueFloat.message}
            </FormFeedback>
          )}
        </Col>
        <Col>
          <Label className="d-block">Valor Boolean</Label>
          <ButtonGroup>
            <Input
              type="radio"
              className="btn-check"
              name="options"
              id="option1"
              value="true"
              checked={valueBoolean === 'true' || valueBoolean === true}
              {...register(`metaData.${indexKey}.valueBoolean`)}
            />
            <Label className="btn btn-secondary shadow-none" htmlFor="option1">
              True
            </Label>

            <Input
              type="radio"
              className="btn-check"
              name="options"
              id="option2"
              value="false"
              checked={valueBoolean === 'false' || valueBoolean === false}
              {...register(`metaData.${indexKey}.valueBoolean`)}
            />
            <Label className="btn btn-secondary shadow-none" htmlFor="option2">
              False
            </Label>
          </ButtonGroup>
          {formState.errors?.metaData?.[indexKey]?.valueBoolean && (
            <FormFeedback type="invalid">
              {formState.errors?.metaData?.[indexKey]?.valueBoolean.message}
            </FormFeedback>
          )}
        </Col>
      </Row>

      <div className="border border-1 rounded">
        <h4 className="p-3 fs-6 m-0 border-bottom border-1">Valor Json</h4>

        <div className="p-3">
          <Controller
            control={control}
            name={`metaData.${indexKey}.valueJson`}
            render={({ field }) => (
              <CustomEditor
                onChange={field.onChange}
                value={field.value}
                language="json"
                onValidate={(markers) => {
                  if (markers.length > 0) {
                    setError(
                      `metaData.${indexKey}.valueJson`,
                      {
                        type: 'manual',
                        message: 'O valor deve ser um JSON válido.',
                      },
                      {
                        shouldFocus: true,
                      },
                    );
                  } else {
                    clearErrors(`metaData.${indexKey}.valueJson`);
                  }
                }}
              />
            )}
          />
          {formState.errors?.metaData?.[indexKey]?.valueJson && (
            <FormFeedback type="invalid" className="d-block">
              {formState.errors?.metaData?.[indexKey]?.valueJson.message}
            </FormFeedback>
          )}
        </div>
      </div>
    </div>
  );
}
