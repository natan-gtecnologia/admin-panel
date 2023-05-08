import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import clsx from 'clsx';
import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';
import { ChangeEvent, useState } from 'react';
import Flatpickr, { DateTimePickerProps } from 'react-flatpickr';
import { Controller, useFormContext } from 'react-hook-form';
import { FormFeedback, Label } from 'reactstrap';

import { flatpickrPt } from '../../../utils/flatpick-pt';
import { CreateOrUpdateCouponSchemaProps } from './schema';

const flatPickrOptions: DateTimePickerProps['options'] = {
  enableTime: true,
  dateFormat: 'd/m/Y H:i',
  time_24hr: true,
  locale: flatpickrPt,
  defaultHour: new Date().getHours(),
  defaultMinute: new Date().getMinutes(),
  maxTime: '23:59',
  mode: 'single',
  hourIncrement: 1,
  onKeyDown: (_a, _b, self) => {
    if (self.hourElement.valueAsNumber > 23) {
      self.hourElement.value = '23';
    }

    if (self.hourElement.valueAsNumber < 0) {
      self.hourElement.value = '00';
    }

    if (self.minuteElement.valueAsNumber > 59) {
      self.minuteElement.value = '00';
    }

    if (self.minuteElement.valueAsNumber < 0) {
      self.minuteElement.value = '00';
    }

    if (self.minuteElement.valueAsNumber % 5 !== 0) {
      self.minuteElement.value = '00';
    }
  },
};

export function CouponPeriod() {
  const { control, formState, setValue } =
    useFormContext<CreateOrUpdateCouponSchemaProps>();
  const [shouldShowFinalDate, setShouldShowFinalDate] = useState(false);

  return (
    <Card className="shadow-none">
      <Card.Body>
        <h4 className="fs-5 text-body mb-0">Período válido</h4>
        <small className="mb-3 d-block fs-6 text-muted fw-normal">
          Defina por quanto tempo esse cupom permanecerá ativo
        </small>

        <div className="mb-3">
          <Label htmlFor="initialDate">Data de início*</Label>
          <Controller
            control={control}
            name="initialDate"
            render={({ field }) => (
              <Flatpickr
                placeholder={format(new Date(), 'dd/MM/Y HH:00', {
                  locale: ptBR,
                })}
                className={clsx('form-control', {
                  'is-invalid': !!formState.errors.initialDate,
                })}
                id="initialDate"
                options={flatPickrOptions}
                value={field.value}
                onChange={(date) => field.onChange(date[0].toISOString())}
              />
            )}
          />
          {!!formState.errors.initialDate && (
            <FormFeedback type="invalid">
              {formState.errors.initialDate.message}
            </FormFeedback>
          )}
        </div>

        <div className="form-check mb-3">
          <Input
            className="form-check-input"
            type="checkbox"
            value=""
            id="shouldDefineEndDate"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setShouldShowFinalDate(e.target.checked);
              setValue('finalDate', null);
            }}
            checked={shouldShowFinalDate}
          />
          <Label
            className="form-check-label text-muted fw-normal"
            htmlFor="shouldDefineEndDate"
          >
            Definir data de término
          </Label>
        </div>

        {shouldShowFinalDate && (
          <div>
            <Label htmlFor="finalDate">Data de fim</Label>
            <Controller
              control={control}
              name="finalDate"
              render={({ field }) => (
                <Flatpickr
                  placeholder={format(new Date(), 'dd/MM/Y HH:00', {
                    locale: ptBR,
                  })}
                  className={clsx('form-control', {
                    'is-invalid': !!formState.errors.finalDate,
                  })}
                  id="finalDate"
                  options={flatPickrOptions}
                  value={field.value}
                  onChange={(date) => field.onChange(date[0].toISOString())}
                />
              )}
            />
            {!!formState.errors.finalDate && (
              <FormFeedback type="invalid">
                {formState.errors.finalDate.message}
              </FormFeedback>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
