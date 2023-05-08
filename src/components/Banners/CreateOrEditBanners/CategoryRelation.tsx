import { Controller, useFormContext } from "react-hook-form";
import {
    FormFeedback,
    Label,
} from 'reactstrap';
import Select from 'react-select';

import { CreateOrUpdateBannerSchemaProps } from "./schema";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "../../../services/apiClient";
import QueryString from "qs";
import { convert_category_strapi } from "../../../utils/convertions/convert_category";
import clsx from "clsx";
import { ICategory } from "../../../@types/category";

export function CategoryRelation({ banner }: any) {
    const { control, formState, watch, setValue } = useFormContext<CreateOrUpdateBannerSchemaProps>()
    const [categories, setCategories] = useState<
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
                },
                paramsSerializer: (params) => {
                    return QueryString.stringify(params);
                },
            });

            const categories: ICategory[] = response.data.data.map(convert_category_strapi) || [];

            const dataCategories = categories.map((category) => ({
                value: String(category.id),
                label: category.title,
            }));

            setCategories((oldTags) => {
                const newCategories = [...oldTags, ...dataCategories];

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

        if (banner) {
            setValue('category_link_id', banner.category_link.data?.id)
        }
    }, []);

    return (
        <div>
            <Label className="form-label" htmlFor="category_link_id">
                Link da categoria
            </Label>

            <Controller
                control={control}
                name="category_link_id"
                render={({ field: { onChange, value, name, ref } }) => (
                    <Select
                        isLoading={isFetching}
                        isSearchable
                        isClearable
                        className={clsx('basic-single', {
                            'is-invalid': !!formState.errors.category_link_id,
                        })}
                        classNamePrefix="select"
                        placeholder="Selecione a categoria"
                        options={categories}
                        value={categories.find((c) => c.value === String(value))}
                        onChange={(val) => {
                            onChange(val?.value ? Number(val.value) : null);
                        }}
                        noOptionsMessage={() => 'Nenhum resultado encontrado'}
                        loadingMessage={() => 'Carregando...'}
                        onMenuScrollToBottom={() => {
                            if (!isFetching && hasNextPage) loadCategories(page + 1);
                        }}
                    />
                )}
            />

            {formState.errors?.category_link_id && (
                <FormFeedback type="invalid">
                    {formState.errors.category_link_id?.message}
                </FormFeedback>
            )}
        </div>
    );
}