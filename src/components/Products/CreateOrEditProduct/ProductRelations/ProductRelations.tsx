import { FormFeedback, Label } from '@growth/growforce-admin-ui/index';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import QueryString from 'qs';
import { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Select from 'react-select';

import { IProduct } from '../../../../@types/product';
import { IStrapiProduct } from '../../../../@types/strapi';
import { api } from '../../../../services/apiClient';
import { convert_product_strapi } from '../../../../utils/convertions/convert_product';
import { CreateOrEditProductSchemaProps } from '../schema';

export function ProductRelation() {
  const { formState, watch, control } =
    useFormContext<CreateOrEditProductSchemaProps>();
  const selectedRelatedProducts = watch('relationed_products');
  const selectedVariations = watch('variations');
  const [products, setProducts] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);
  const [isFetching, setIsFetching] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [page, setPage] = useState(1);
  const router = useRouter();
  const id = router.query.id as string | undefined;

  async function loadProducts(nextPage = 1) {
    try {
      if (!hasNextPage || isFetching) return;
      setIsFetching(true);

      const response = await api.get('/products', {
        params: {
          populate: '*',
          publicationState: 'preview',
          pagination: {
            pageSize: 10,
            page: nextPage,
          },
          filters: {
            id: {
              $notIn: [...selectedRelatedProducts, ...selectedVariations, id],
            },
          },
        },
        paramsSerializer: (params) => {
          return QueryString.stringify(params);
        },
      });
      const { data: selectedTagsResponse } = await api.get('/products', {
        params: {
          filters: {
            id: {
              $in: [...selectedRelatedProducts, ...selectedVariations],
            },
          },
        },
        paramsSerializer: (params) => {
          return QueryString.stringify(params);
        },
      });

      const products: IProduct[] =
        response.data.data.map(convert_product_strapi) || [];

      const selectedDataProductsFormated = selectedTagsResponse.data.map(
        (tag: IStrapiProduct) => {
          const convertedProduct = convert_product_strapi(tag);

          return {
            value: String(convertedProduct.id),
            label: convertedProduct.title,
          };
        }
      );

      const dataProducts = products.map((tag) => ({
        value: String(tag.id),
        label: tag.title,
      }));
      const options = [...dataProducts, ...selectedDataProductsFormated];

      setProducts((oldTags) => {
        const newProducts = [...oldTags, ...options];

        return newProducts.filter((value, index) => {
          const _value = JSON.stringify(value);
          return (
            index ===
            newProducts.findIndex((obj) => {
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
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div>
        <Label className="form-label" htmlFor={`relationed_products`}>
          Produtos relacionados
        </Label>
        <Controller
          control={control}
          name="relationed_products"
          render={({ field: { onChange, value } }) => (
            <Select
              isLoading={isFetching}
              isSearchable
              isMulti
              className={clsx('basic-single', {
                'is-invalid': !!formState.errors.relationed_products,
              })}
              classNamePrefix="select"
              placeholder="Selecione os produtos relacionados"
              options={products}
              value={products.filter((c) => value?.includes(Number(c.value)))}
              onChange={(val) => {
                const ids = val.map((option) => Number(option.value));
                onChange(ids);
              }}
              noOptionsMessage={() => 'Nenhum resultado encontrado'}
              loadingMessage={() => 'Carregando...'}
              onMenuScrollToBottom={() => {
                if (!isFetching && hasNextPage) loadProducts(page + 1);
              }}
            />
          )}
        />

        {formState.errors.relationed_products && (
          <FormFeedback type="invalid">
            {formState.errors.relationed_products.message}
          </FormFeedback>
        )}
      </div>

      <div>
        <Label className="form-label" htmlFor={`variations`}>
          Variações do produto
        </Label>
        <Controller
          control={control}
          name="variations"
          render={({ field: { onChange, value } }) => (
            <Select
              isLoading={isFetching}
              isSearchable
              isMulti
              className={clsx('basic-single', {
                'is-invalid': !!formState.errors.relationed_products,
              })}
              classNamePrefix="select"
              placeholder="Selecione as variações do produto"
              options={products}
              value={products.filter((c) => value?.includes(Number(c.value)))}
              onChange={(val) => {
                const ids = val.map((option) => Number(option.value));
                onChange(ids);
              }}
              noOptionsMessage={() => 'Nenhum resultado encontrado'}
              loadingMessage={() => 'Carregando...'}
              onMenuScrollToBottom={() => {
                if (!isFetching && hasNextPage) loadProducts(page + 1);
              }}
            />
          )}
        />

        {!!formState.errors.variations && (
          <FormFeedback type="invalid">
            {formState.errors.variations.message}
          </FormFeedback>
        )}
      </div>
    </>
  );
}
