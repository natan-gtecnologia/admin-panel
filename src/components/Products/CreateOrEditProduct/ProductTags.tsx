import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import Link from '@growth/growforce-admin-ui/components/Common/Link';
import { FormFeedback, Label } from '@growth/growforce-admin-ui/index';
import QueryString from 'qs';
import { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Select from 'react-select';

import { IStrapiTag } from '../../../@types/strapi';
import { ITag } from '../../../@types/tag';
import { api } from '../../../services/apiClient';
import { convert_tag_strapi } from '../../../utils/convertions/convert_tag';
import { CreateOrEditProductSchemaProps } from './schema';

export function ProductTags() {
  const { formState, control, watch } =
    useFormContext<CreateOrEditProductSchemaProps>();
  const selectedTags = watch('tags');
  const [page, setPage] = useState(1);
  const [tags, setTags] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);
  const [isFetching, setIsFetching] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  async function loadTags(nextPage = 1) {
    try {
      if (!hasNextPage || isFetching) return;
      setIsFetching(true);

      const response = await api.get('/tags', {
        params: {
          populate: '*',
          publicationState: 'preview',
          pagination: {
            pageSize: 10,
            page: nextPage,
          },
          filters: {
            id: {
              $notIn: selectedTags,
            },
          },
        },
        paramsSerializer: (params) => {
          return QueryString.stringify(params, { arrayFormat: 'repeat' });
        },
      });
      const { data: selectedTagsResponse } = await api.get('/tags', {
        params: {
          filters: {
            id: {
              $in: selectedTags,
            },
          },
        },
        paramsSerializer: (params) => {
          return QueryString.stringify(params);
        },
      });

      const tags: ITag[] = response.data.data.map(convert_tag_strapi) || [];

      const selectedDataTagsFormated = selectedTagsResponse.data.map(
        (tag: IStrapiTag) => {
          const convertedTag = convert_tag_strapi(tag);

          return {
            value: String(convertedTag.id),
            label: convertedTag.tag,
          };
        }
      );

      const dataTags = tags.map((tag) => ({
        value: String(tag.id),
        label: tag.tag,
      }));
      const options = [...dataTags, ...selectedDataTagsFormated];

      setTags((oldTags) => {
        const newTags = [...oldTags, ...options];

        return newTags.filter((value, index) => {
          const _value = JSON.stringify(value);
          return (
            index ===
            newTags.findIndex((obj) => {
              return JSON.stringify(obj) === _value;
            })
          );
        });
      });

      setHasNextPage(response.data.meta.pagination.pageCount > nextPage);
      setPage(nextPage);
    } finally {
      setIsFetching(false);
    }
  }

  useEffect(() => {
    loadTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="shadow-none">
      <Card.Header>
        <h5 className="mb-0">Tags</h5>
      </Card.Header>
      <Card.Body>
        <div>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <Label
              className="form-label text-muted fw-normal mb-0"
              htmlFor={`productType.category`}
            >
              Selecione a categoria do produto
            </Label>
            <Link href="/tags/create">Adicionar nova</Link>
          </div>

          <Controller
            control={control}
            name="tags"
            render={({ field: { onChange, value, name, ref } }) => (
              <Select
                isLoading={isFetching}
                isSearchable
                isMulti
                className="basic-single"
                classNamePrefix="select"
                placeholder="Selecione a tag"
                options={tags}
                value={tags.filter((c) => value?.includes(Number(c.value)))}
                onChange={(val) => {
                  const ids = val.map((option) => Number(option.value));
                  onChange(ids);
                }}
                noOptionsMessage={() => 'Nenhum resultado encontrado'}
                loadingMessage={() => 'Carregando...'}
                onMenuScrollToBottom={() => {
                  if (!isFetching && hasNextPage) loadTags(page + 1);
                }}
              />
            )}
          />

          {formState.errors.tags && (
            <FormFeedback type="invalid">
              {formState.errors.tags.message}
            </FormFeedback>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
