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
import { IProduct } from "../../../@types/product";
import { convert_product_strapi } from "../../../utils/convertions/convert_product";
import { IStrapiProduct } from "../../../@types/strapi";
import clsx from "clsx";

export function ProductRelation({ banner }: any) {
    const { control, formState, setValue } = useFormContext<CreateOrUpdateBannerSchemaProps>()
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
                },
                paramsSerializer: (params) => {
                    return QueryString.stringify(params);
                },
            });

            const products: IProduct[] =
                response.data.data.map(convert_product_strapi) || [];

            const dataProducts = products.map((tag) => ({
                value: String(tag.id),
                label: tag.title,
            }));

            setProducts((oldTags) => {
                const newProducts = [...oldTags, ...dataProducts];

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

        if (banner) {
            setValue('category_link_id', banner.product_link?.data?.id)
        }
    }, []);

    return (
        <div>
            <Label className="form-label" htmlFor="category_link_id">
                Link do produto
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
                            'is-invalid': !!formState.errors.product_link_id,
                        })}
                        classNamePrefix="select"
                        placeholder="Selecione o produto"
                        options={products}
                        value={products.find((c) => c.value === String(value))}
                        onChange={(val) => {
                            onChange(val?.value ? Number(val.value) : null);
                        }}
                        noOptionsMessage={() => 'Nenhum resultado encontrado'}
                        loadingMessage={() => 'Carregando...'}
                        onMenuScrollToBottom={() => {
                            if (!isFetching && hasNextPage) loadProducts(page + 1);
                        }}
                    />
                )}
            />

            {formState.errors?.product_link_id && (
                <FormFeedback type="invalid">
                    {formState.errors.product_link_id?.message}
                </FormFeedback>
            )}
        </div>
    );
}