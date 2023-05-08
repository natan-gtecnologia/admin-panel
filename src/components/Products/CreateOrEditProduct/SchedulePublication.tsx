import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { FormFeedback, Label } from '@growth/growforce-admin-ui/index';
import clsx from 'clsx';
import Flatpickr from 'react-flatpickr';
import { Controller, useFormContext } from 'react-hook-form';

import { flatpickrPt } from '../../../utils/flatpick-pt';
import { CreateOrEditProductSchemaProps } from './schema';

export function SchedulePublication() {
  const { formState, control } =
    useFormContext<CreateOrEditProductSchemaProps>();

  return (
    <Card className="shadow-none">
      <Card.Header>
        <h5 className="mb-0">Agendar publicação</h5>
      </Card.Header>
      <Card.Body>
        <div>
          <Label className="form-label" htmlFor="schedule_publication">
            Data e Hora da Publicação
          </Label>
          <Controller
            control={control}
            name="schedulePublication"
            render={({ field }) => (
              <Flatpickr
                placeholder="Insira a data da publicação"
                className={clsx('form-control', {
                  'is-invalid': !!formState.errors.schedulePublication,
                })}
                options={{
                  enableTime: true,
                  dateFormat: 'd/m/Y H:i',
                  locale: flatpickrPt,
                  time_24hr: true,
                }}
                value={field.value}
                onChange={(date) => field.onChange(date[0])}
              />
            )}
          />

          {!!formState.errors.schedulePublication && (
            <FormFeedback type="invalid">
              {formState.errors.schedulePublication.message}
            </FormFeedback>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
