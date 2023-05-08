import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import { Fragment } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Select from 'react-select';
import { FormFeedback, FormGroup, Label } from 'reactstrap';

import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { getCompanies } from '../getCompanies';
import { CreateOrUpdateCompanySchema } from './schema';

export function Relations() {
  const { register, formState, control, getValues } =
    useFormContext<CreateOrUpdateCompanySchema>();
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
  const id = getValues('id') ?? 0;

  return (
    <Fragment>
      <Card>
        <Card.Header>
          <h4 className="fs-5 text-body m-0 fw-bold">Relacionamentos</h4>
        </Card.Header>
        <Card.Body>
          <FormGroup>
            <Label className="form-label">NODE ID</Label>
            <Input disabled {...register('nodeId')} />
          </FormGroup>

          {id === 0 && (
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
                    options={companies.filter((c) => c.value !== id)}
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
          )}
        </Card.Body>
      </Card>
    </Fragment>
  );
}
