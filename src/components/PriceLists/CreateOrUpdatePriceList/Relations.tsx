import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Fragment } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Select from 'react-select';
import { FormFeedback, FormGroup, Label } from 'reactstrap';

import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { getCompanies } from '../../Companies/getCompanies';
import { CreateOrUpdatePriceListSchema } from './schema';

export function Relations() {
  const { formState, control } =
    useFormContext<CreateOrUpdatePriceListSchema>();
  const {
    data: { companies },
  } = useQuery(
    ['companies'],
    async () => {
      const response = await getCompanies(undefined, {
        pagination: {
          pageSize: 100,
          page: 1,
        },
      });

      return {
        companies: response.companies.map((ccompany) => ({
          label: ccompany.name,
          value: ccompany.id,
        })),
        totalPages: response.totalPages,
      };
    },
    {
      initialData: {
        companies: [],
        totalPages: 1,
      },
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    },
  );

  return (
    <Fragment>
      <Card>
        <Card.Header>
          <h4 className="fs-5 text-body m-0 fw-bold">Relacionamentos</h4>
        </Card.Header>
        <Card.Body>
          <div className="form-check mb-2">
            <Controller
              control={control}
              name="enabled"
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
            <Label
              className="form-check-label fw-normal"
              htmlFor="otherCoupons"
            >
              Lista de preço ativa?
            </Label>
          </div>

          <FormGroup>
            <Label className="form-label" htmlFor="company">
              Empresa
            </Label>

            <Controller
              control={control}
              name="company"
              render={({ field: { onChange, value, name, ref } }) => (
                <Select
                  isSearchable
                  isClearable
                  className={clsx('basic-single', {
                    'is-invalid': !!formState.errors.company,
                  })}
                  classNamePrefix="select"
                  placeholder="Selecione a categoria"
                  options={companies}
                  value={companies.find((c) => c.value === value)}
                  onChange={(val) => {
                    onChange(val?.value ? val.value : null);
                  }}
                  noOptionsMessage={() => 'Nenhum resultado encontrado'}
                  loadingMessage={() => 'Carregando...'}
                />
              )}
            />

            {formState.errors?.company && (
              <FormFeedback type="invalid">
                {formState.errors.company?.message}
              </FormFeedback>
            )}
          </FormGroup>
        </Card.Body>
      </Card>
    </Fragment>
  );
}
