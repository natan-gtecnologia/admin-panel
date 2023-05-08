import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { FormFeedback, Label } from '@growth/growforce-admin-ui/index';
import clsx from 'clsx';
import qs from 'qs';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { IBrand } from '../../../../@types/brand';
import { IDistributionCenter } from '../../../../@types/distribution-center';
import { api } from '../../../../services/apiClient';
import { convert_brand_strapi } from '../../../../utils/convertions/convert_brand';
import { convert_distribution_center_strapi } from '../../../../utils/convertions/convert_distribution_center';
import { CreateOrEditProductSchemaProps } from '../schema';
import { ProductRelation } from './ProductRelations';

export function ProductRelations() {
  const { formState, register, watch, setValue } =
    useFormContext<CreateOrEditProductSchemaProps>();
  const selectedDistributionCenters = watch('distribution_centers');

  const [brands, setBrands] = useState<IBrand[]>([]);
  const [distributionCenters, setDistributionCenters] = useState<
    IDistributionCenter[]
  >([]);

  useEffect(() => {
    async function fetch() {
      const DEFAULT_PARAMS = {
        populate: '*',
        publicationState: 'preview',
        pagination: {
          pageSize: 100,
        },
      };
      const brandRequest = api.get('/brands', {
        params: DEFAULT_PARAMS,
        paramsSerializer: (params) => {
          return qs.stringify(params);
        },
      });

      const distributionCentersRequest = api.get('/distribution-centers', {
        params: DEFAULT_PARAMS,
        paramsSerializer: (params) => {
          return qs.stringify(params);
        },
      });

      const [brandsResponse, distributionCentersResponse] = await Promise.all([
        brandRequest,
        distributionCentersRequest,
      ]);

      setBrands(brandsResponse.data.data.map(convert_brand_strapi) || []);
      setDistributionCenters(
        distributionCentersResponse.data.data.map(
          convert_distribution_center_strapi
        ) || []
      );
    }
    fetch();
  }, []);

  return (
    <Card className="shadow-none">
      <Card.Header>
        <h5 className="mb-0">Relações</h5>
      </Card.Header>
      <Card.Body className="d-flex flex-column gap-3">
        <div>
          <Label className="form-label" htmlFor={`brand`}>
            Marca
          </Label>
          <select
            className={clsx('form-select', {
              'is-invalid': !!formState.errors.brand,
            })}
            aria-label="Tipo de produtos"
            id={`brand`}
            {...register('brand', {
              valueAsNumber: true,
            })}
          >
            <option value="">Selecione uma opção</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>

          {!!formState.errors.brand && (
            <FormFeedback type="invalid">
              {formState.errors.brand.message}
            </FormFeedback>
          )}
        </div>

        <ProductRelation />

        <div>
          <Label className="form-label" htmlFor={`distribution_centers`}>
            Centro de distribuição
          </Label>
          <select
            className={clsx('form-select', {
              'is-invalid': !!formState.errors.distribution_centers,
            })}
            aria-label="Tipo de produtos"
            id={`distribution_centers`}
            value=""
            onChange={(e) => {
              const value = Number(e.target.value);
              if (!selectedDistributionCenters.includes(value)) {
                setValue('distribution_centers', [
                  ...selectedDistributionCenters,
                  value,
                ]);
              } else {
                setValue(
                  'distribution_centers',
                  selectedDistributionCenters.filter((c) => c !== value)
                );
              }
            }}
          >
            <option value="">Selecione uma opção</option>
            {distributionCenters.map((dCenter) => (
              <option key={`d-center-${dCenter.id}`} value={dCenter.id}>
                {dCenter.name}
              </option>
            ))}
          </select>

          {!!formState.errors.distribution_centers && (
            <FormFeedback type="invalid">
              {formState.errors.distribution_centers.message}
            </FormFeedback>
          )}

          <div className="choices__list choices__list--multiple mt-2 d-flex flex-wrap">
            {distributionCenters
              .filter((dCenter) =>
                selectedDistributionCenters.find((c) => c === dCenter.id)
              )
              .map((dCenter) => (
                <div
                  key={dCenter.id}
                  className="choices__item choices__item--selectable"
                >
                  {dCenter.name}
                  <button
                    type="button"
                    className="choices__button"
                    aria-label={`Remove item: '${dCenter.name}'`}
                    data-button=""
                    onClick={() => {
                      setValue(
                        'distribution_centers',
                        selectedDistributionCenters.filter(
                          (c) => c !== dCenter.id
                        )
                      );
                    }}
                  >
                    Remove item
                  </button>
                </div>
              ))}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
