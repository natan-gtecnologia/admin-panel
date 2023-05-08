import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { FormFeedback, Label } from '@growth/growforce-admin-ui/index';
import clsx from 'clsx';
import QueryString from 'qs';
import { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Select from 'react-select';

import { ICategory } from '../../../@types/category';
import { IStrapiCategory } from '../../../@types/strapi';
import { api } from '../../../services/apiClient';
import { convert_category_strapi } from '../../../utils/convertions/convert_category';
import { CreateOrEditProductSchemaProps } from './schema';

export function ProductCategories() {
  const { formState, watch, control } =
    useFormContext<CreateOrEditProductSchemaProps>();
  const selectedCategories = watch('categories');
  const [categories, setCategories] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);
  const [isFetching, setIsFetching] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [page, setPage] = useState(1);

  async function loadCategories(nextPage = 1) {
    try {
      if (!hasNextPage || isFetching) return;
      setIsFetching(true);

      const response = await api.get('/categories', {
        params: {
          populate: '*',
          publicationState: 'preview',
          pagination: {
            pageSize: 10,
            page: nextPage,
          },
          filters: {
            id: {
              $notIn: selectedCategories,
            },
          },
        },
        paramsSerializer: (params) => {
          return QueryString.stringify(params);
        },
      });
      const { data: selectedTagsResponse } = await api.get('/categories', {
        params: {
          filters: {
            id: {
              $in: selectedCategories,
            },
          },
        },
        paramsSerializer: (params) => {
          return QueryString.stringify(params);
        },
      });

      const categories: ICategory[] =
        response.data.data.map(convert_category_strapi) || [];

      const selectedDataCategoriesFormated = selectedTagsResponse.data.map(
        (tag: IStrapiCategory) => {
          const convertedProduct = convert_category_strapi(tag);

          return {
            value: String(convertedProduct.id),
            label: convertedProduct.title,
          };
        }
      );

      const dataCategories = categories.map((tag) => ({
        value: String(tag.id),
        label: tag.title,
      }));
      const options = [...dataCategories, ...selectedDataCategoriesFormated];

      setCategories((oldCategories) => {
        const newCategories = [...oldCategories, ...options];

        return newCategories.filter((value, index) => {
          const _value = JSON.stringify(value);
          return (
            index ===
            newCategories.findIndex((obj) => {
              return JSON.stringify(obj) === _value;
            })
          );
        });
      });

      setHasNextPage(response.data.meta.pageCount > nextPage);
      setPage(nextPage);
    } finally {
      setIsFetching(false);
    }
  }

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="shadow-none">
      <Card.Header>
        <h5 className="mb-0">Categorias de Produtos</h5>
      </Card.Header>
      <Card.Body>
        <div>
          <div className="d-flex align-items-center justify-content-between">
            <Label
              className="form-label text-muted fw-normal"
              htmlFor={`productType.category`}
            >
              Selecione a categoria do produto
            </Label>
            {/*<a href="#" className="text-decoration-underline">
              Adicionar nova
            </a>*/}
          </div>
          <Controller
            control={control}
            name="categories"
            render={({ field: { onChange, value } }) => (
              <Select
                isLoading={isFetching}
                isSearchable
                isMulti
                className={clsx('basic-single', {
                  'is-invalid': !!formState.errors.categories,
                })}
                classNamePrefix="select"
                placeholder="Selecione os produtos relacionados"
                options={categories}
                value={categories.filter((c) =>
                  value?.includes(Number(c.value))
                )}
                onChange={(val) => {
                  const ids = val.map((option) => Number(option.value));
                  onChange(ids);
                }}
                noOptionsMessage={() => 'Nenhum resultado encontrado'}
                loadingMessage={() => 'Carregando...'}
                onMenuScrollToBottom={() => {
                  if (!isFetching && hasNextPage) loadCategories(page + 1);
                }}
              />
            )}
          />

          {formState.errors.categories && (
            <FormFeedback type="invalid">
              {formState.errors.categories.message}
            </FormFeedback>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
