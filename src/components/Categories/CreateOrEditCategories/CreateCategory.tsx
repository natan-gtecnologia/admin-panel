/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import {
  Col,
  FormFeedback,
  Label,
  Row,
} from '@growth/growforce-admin-ui/index';
import { Controller, useFormContext } from 'react-hook-form';
import { CreateOrUpdateCategoriesSchemaProps } from './schema';

import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import debounce from 'lodash/debounce';
import dynamic from 'next/dynamic';
import { useCallback } from 'react';
import slugify from 'slugify';
const CKEditor = dynamic(
  async () => (await import('@ckeditor/ckeditor5-react')).CKEditor,
  {
    ssr: false,
  },
);

import { validateSlug } from './slugValidationCategory';

interface Props {
  categoryId?: number;
}

export function CreateCategory({ categoryId }: Props) {
  const { formState, register, setValue, setError, clearErrors } =
    useFormContext<CreateOrUpdateCategoriesSchemaProps>();

  const slugValidation = useCallback(
    async (slug: string) => {
      try {
        if (formState.errors.slug) return;

        const isValid = await validateSlug(slug, categoryId);

        if (!isValid) {
          setError('slug', {
            type: 'manual',
            message: 'Slug já está em uso',
          });
        } else {
          clearErrors('slug');
        }
      } catch (err) {
        console.log(err);
      }
    },
    [categoryId, clearErrors, formState.errors.slug, setError],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceSlugValidation = useCallback(debounce(slugValidation, 500), []);

  return (
    <Card>
      <Card.Body>
        <Row>
          <Col md={6}>
            <Label className="form-label" htmlFor="title">
              Título da categoria
            </Label>
            <Input
              type="text"
              id="title"
              placeholder="Insira o título da categoria"
              invalid={!!formState.errors.title}
              {...register('title', {
                onChange: (e) => {
                  setValue(
                    'slug',
                    slugify(e.target.value, { lower: true, trim: true }),
                  );
                },
                onBlur: (e) => {
                  debounceSlugValidation(
                    slugify(e.target.value, { lower: true, trim: true }),
                  );
                },
              })}
            />
            {formState.errors.title && (
              <FormFeedback type="invalid">
                {formState.errors.title.message}
              </FormFeedback>
            )}
          </Col>
          <Col md={6}>
            <Label className="form-label" htmlFor="slug">
              Slug
            </Label>
            <Input
              type="text"
              id="slug"
              placeholder="titulo-slug"
              invalid={!!formState.errors.slug}
              {...register('slug', {
                onChange: (e) => {
                  debounceSlugValidation(
                    slugify(e.target.value, { lower: true, trim: true }),
                  );
                },
              })}
            />
            {formState.errors.slug && (
              <FormFeedback type="invalid">
                {formState.errors.slug.message}
              </FormFeedback>
            )}
          </Col>
        </Row>
        <div className="mt-3">
          <Label className="form-label">Descrição do produto</Label>
          <Controller
            name="description"
            render={({ field }) => (
              <CKEditor
                // @ts-ignore
                editor={ClassicEditor}
                data={field.value}
                onChange={(_, editor: any) => {
                  field.onChange(editor.getData());
                }}
              />
            )}
          />
          {!!formState.errors.description && (
            <FormFeedback type="invalid">
              {formState.errors.description.message}
            </FormFeedback>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
