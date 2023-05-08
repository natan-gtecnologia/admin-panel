import { Controller, useFormContext, useFieldArray } from "react-hook-form";
import {
    FormFeedback,
    Label,
    Row,
    Col
} from 'reactstrap';
import Select from 'react-select';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import Close from '/public/svg/close.svg';
import More from '/public/svg/more.svg';

import { CreateOrUpdateBannerSchemaProps } from "./schema";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "../../../services/apiClient";
import QueryString from "qs";
import clsx from "clsx";
import { convert_banner_strapi } from '../../../utils/convertions/convert_banner';
import Image from "next/image";

export function BannerRelation({ banner }: any) {

    const bannerSelect = banner?.attributes?.banner?.map((item) => convert_banner_strapi(item.banner.data) || [])
    
    const bannerSelectConverter = bannerSelect?.map((category) => ({
        value: String(category?.id),
        label: category?.title,
        image: category?.desktop_image?.data?.attributes?.url
    }));

    const { control, formState,  setValue, register } = useFormContext<CreateOrUpdateBannerSchemaProps>()
    const [categories, setCategories] = useState<
        {
            value: string;
            label: string;
            image: string;
        }[]
    >([]);

    const { fields: bannerFields, append: bannerAppend, remove: bannerRemove } = useFieldArray({
        control,
        name: "banner",
    });

    const [isFetching, setIsFetching] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [page, setPage] = useState(1);

    async function loadCategories(nextPage = 1) {
        try {
            if (!hasNextPage || isFetching) return;
            setIsFetching(true);

            const response = await api.get('/banners', {
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

            const categories = response.data.data.map(convert_banner_strapi) || [];

            const dataCategories = categories.map((category) => ({
                value: String(category?.id),
                label: category?.title,
                image: category?.desktop_image?.data?.attributes?.url
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
            setValue('banner', banner.id)
        }
    }, []);

    return (
        <div>
            <Label className="form-label" htmlFor="category_link_id">
                Link dos banners
            </Label>

            {bannerFields.map((field, index: number) => (
                <Row className="mb-3 mt-3" key={index}>
                    <Col md={6}>
                        <div>
                            <Label className="form-label" htmlFor="type">
                                Local de exibição
                            </Label>
                            <select
                                className={clsx('form-select', {
                                    'is-invalid': !!formState.errors.banner,
                                })}
                                aria-label=""
                                id="type"
                                {...register(`banner.${index}.type`)}
                            >
                                <option value=""></option>
                                <option value="hero">Hero</option>
                                <option value="header">Header</option>
                                <option value="section">Section</option>
                                <option value="footer">Footer</option>
                            </select>

                            {!!formState.errors.banner && (
                                <FormFeedback type="invalid">
                                    Selecione um valor
                                </FormFeedback>
                            )}
                        </div>
                    </Col>
                    <Col md={6}>
                        <Label className="form-label" htmlFor="order">
                            Ordem
                        </Label>
                        <Input
                            id="order"
                            name='order'
                            placeholder="Digite a ordem do banner"
                            type='number'
                            invalid={!!formState.errors.order}
                            {...register(`banner.${index}.order`, {
                                valueAsNumber: true,
                            })}
                        />
                        {formState.errors.order && (
                            <FormFeedback type="invalid">
                                {formState.errors.order.message}
                            </FormFeedback>
                        )}
                    </Col>
                    <Col className="mt-3" lg={10}>
                        <Controller
                            name={`banner.${index}.banner`}
                            control={control}
                            render={({ field: { onChange, value, name, ref } }) => (
                                <Select
                                    isLoading={isFetching}
                                    isSearchable
                                    isClearable
                                    className={clsx('basic-single', {
                                        'is-invalid': !!formState.errors.category_link_id,
                                    })}
                                    classNamePrefix="select"
                                    placeholder="Selecione o banner"
                                    formatOptionLabel={categories => (
                                        <div className="d-flex align-items-center">
                                            <Image src={categories.image} width={50} height={50} alt="image-banner" />
                                            <span>&ensp;{categories.label}</span>
                                        </div>
                                    )}
                                    options={categories}
                                    defaultValue={bannerSelectConverter && {...bannerSelectConverter[index]}}
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
                    </Col>
                    {index === 0
                        ?
                        <Col className="mt-3">
                            <button
                                className="btn btn-primary w-100"
                                type="button"
                                id="button-addon1"
                                onClick={() => {
                                    bannerAppend({})
                                }}
                            >
                               <More/>
                            </button>
                        </Col>
                        :
                        <Col className="mt-3 d-flex justify-content-between">
                            <button
                                className="btn btn-primary w-49"
                                type="button"
                                id="button-addon1"
                                onClick={() => {
                                    bannerAppend({})
                                }}
                            >
                                <More/>
                            </button>
                            <button
                                className="btn btn-danger w-49"
                                type="button"
                                id="button-addon1"
                                onClick={() => {
                                    bannerRemove(index);
                                }}
                            >
                               <Close/>
                            </button>
                        </Col>
                    }
                </Row>
            ))}
        </div>
    );
}