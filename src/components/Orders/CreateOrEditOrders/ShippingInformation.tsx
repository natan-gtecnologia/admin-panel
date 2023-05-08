import { Input } from "@growth/growforce-admin-ui/components/Common/Form/Input";
import { useFormContext } from "react-hook-form";
import {
    Col,
    FormFeedback,
    Label,
    Row,
} from '@growth/growforce-admin-ui/index';
import { CreateOrUpdateOrdersSchemaProps } from "./schema";
import { cepMask } from "apps/growforce/admin-panel/utils/masks";
import { useCallback, useEffect, useState } from "react";
import { api } from "apps/growforce/admin-panel/services/apiClient";
import { debounce } from "lodash";
import { IProduct } from "apps/growforce/admin-panel/@types/product";
import { formatNumberToReal } from "@growth/core/util/formatting";

export interface MethodShippingProps {
    methodId: string;
    name: string;
    price: number;
    deliveryTime: string;
}
export interface ShippingInformation {
    products: IProduct[];
    methodsShipping: MethodShippingProps[];
    setMethodsShipping: (data: MethodShippingProps[]) => void;
}

export function ShippingInformation({ products, methodsShipping, setMethodsShipping }: ShippingInformation) {
    const { formState, register, watch, getValues, setError, setValue, trigger } = useFormContext<CreateOrUpdateOrdersSchemaProps>();
    const typeShippingAddress = watch('shippingAddress.optionShipping');
    const items: any = getValues('items.items');

    async function getAddress(cep: string) {
        const addressResponse = await api.get(`/util/address/${cep}`);
        return {
            address: addressResponse.data,
        };
    }

    const handleLoadShippingMethods = async (cepWithoutMask: string) => {
        const items: any = getValues('items.items');
        const productPhysical = items?.filter((item) => item.productType === "physical")
        try {
            const shippingCostResponse = await api.post(
                `/logistics/shipping/melhorenvio`,
                {
                    postcode: cepWithoutMask,
                    products: productPhysical.map(product => ({
                        height: product.dimension?.height,
                        width: product.dimension?.width,
                        length: product.dimension?.length,
                        weight: product.dimension?.weight,
                        quantity: product.quantity,
                        amount: product.price.salePrice,
                    })),
                }
            );

            const shippingCost = shippingCostResponse.data.data;
            setMethodsShipping(shippingCost);

            const lowestShipping = shippingCost.reduce(
                (previous: MethodShippingProps, current: MethodShippingProps) => {
                    return current.price < previous.price ? current : previous;
                }
            );

            if (lowestShipping.price === 0) {
                setValue('shippingAddress.shippingMethod', lowestShipping.methodId);
                trigger('shippingAddress.shippingMethod');
            }
        } catch (error) {
            console.log('Erro ao carregar os métodos de entrega', error);
        }
    };

    const _handleLoadAddress = useCallback(async () => {
        try {
            const cep = getValues('shippingAddress.postCode');
            if (!cep) throw new Error('Invalid cep');

            const cepWithoutMask = cep.replace(/[^\d]/g, '');
            if (cepWithoutMask?.length < 8) throw new Error('Invalid cep');

            const response = await getAddress(cepWithoutMask);
            const address = response.address as any;
            setValue(`shippingAddress.address1`, address.logradouro);
            setValue(`shippingAddress.address2`, address.complemento);
            setValue(`shippingAddress.neighborhood`, address.bairro);
            setValue(`shippingAddress.city`, address.localidade);
            setValue(`shippingAddress.state`, address.uf.toLocaleUpperCase());
            trigger('shippingAddress');

            handleLoadShippingMethods(cepWithoutMask);
        } catch (err) {
            setError(`shippingAddress.postCode`, {
                type: 'manual',
                message: 'CEP inválido',
            });
        }
    }, [getValues, setValue, trigger, setError]);

    const handleLoadAddress = useCallback(debounce(_handleLoadAddress, 600), [])
    const productPhysical = items?.filter((item) => item.productType === "physical")

    return (
        <div>
            {productPhysical?.length > 0 ? (
                <Row>
                    <Col lg={6} sm={6}>
                        <div>
                            <div className="form-check card-radio">
                                <Input
                                    id="withdraw_now"
                                    name="type"
                                    type="radio"
                                    className="form-check-input"
                                    value="withdraw_now"
                                    {...register('shippingAddress.optionShipping')}
                                />
                                <Label
                                    className="form-check-label"
                                    htmlFor="withdraw_now"
                                >
                                    <span className="fs-16 text-muted me-2">
                                        <i className="ri-pixelfed-line align-bottom"></i>
                                    </span>
                                    <span className="fs-14 text-wrap">
                                        Retirar na loja
                                    </span>
                                </Label>
                            </div>
                        </div>
                    </Col>
                    <Col lg={6} sm={6}>
                        <div>
                            <div className="form-check card-radio">
                                <Input
                                    id="shipping"
                                    name="type"
                                    type="radio"
                                    className="form-check-input"
                                    value="shipping"
                                    {...register('shippingAddress.optionShipping')}
                                />
                                <Label
                                    className="form-check-label"
                                    htmlFor="shipping"
                                >
                                    <span className="fs-16 text-muted me-2">
                                        <i className="ri-bank-card-fill align-bottom"></i>
                                    </span>
                                    <span className="fs-14 text-wrap">
                                        Enviar
                                    </span>
                                </Label>
                            </div>
                        </div>
                    </Col>
                </Row>
            ) : (
                <Row>
                    <Col lg={12} sm={6}>
                        <div>
                            <div className="form-check card-radio">
                                <Input
                                    id="esim"
                                    name="type"
                                    type="radio"
                                    className="form-check-input"
                                    value="esim"
                                    {...register('shippingAddress.optionShipping')}
                                />
                                <Label
                                    className="form-check-label"
                                    htmlFor="esim"
                                >
                                    <span className="fs-16 text-muted me-2">
                                        <i className="ri-bank-card-fill align-bottom"></i>
                                    </span>
                                    <span className="fs-14 text-wrap">
                                        Chip digital (e-Sim)
                                    </span>
                                </Label>
                            </div>
                        </div>
                    </Col>
                </Row>
            )}

            {typeShippingAddress === 'shipping' && productPhysical?.length > 0 && (
                <>
                    <Row>
                        <Col md={4}>
                            <div className="mb-3">
                                <Label htmlFor="shippingAddress.postCode" className="form-label">
                                    Cep
                                </Label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    id="shippingAddress.postCode"
                                    placeholder="Cep"
                                    {...register('shippingAddress.postCode', {
                                        onChange: (e) => {
                                            cepMask.onChange(e);
                                            handleLoadAddress();
                                        },
                                    })}
                                    invalid={!!formState.errors?.shippingAddress?.postCode}
                                />
                                {formState.errors?.shippingAddress?.postCode && (
                                    <FormFeedback type="invalid">
                                        {formState.errors.shippingAddress.postCode.message}
                                    </FormFeedback>
                                )}
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4}>
                            <div className="mb-3">
                                <Label
                                    htmlFor="shippingAddress.address1"
                                    className="form-label"
                                >
                                    Endereço
                                </Label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    id="shippingAddress.address1"
                                    placeholder="Endereço"
                                    {...register('shippingAddress.address1')}
                                    invalid={!!formState.errors?.shippingAddress?.address1}
                                />
                                {formState.errors?.shippingAddress?.address1 && (
                                    <FormFeedback type="invalid">
                                        {formState.errors.shippingAddress.address1.message}
                                    </FormFeedback>
                                )}
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="mb-3">
                                <Label
                                    htmlFor="shippingAddress.address2"
                                    className="form-label"
                                >
                                    Complemento
                                </Label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    id="shippingAddress.address2"
                                    placeholder="Complemento"
                                    {...register('shippingAddress.address2')}
                                    invalid={!!formState.errors?.shippingAddress?.address2}
                                />
                                {formState.errors?.shippingAddress?.address2 && (
                                    <FormFeedback type="invalid">
                                        {formState.errors.shippingAddress.address2.message}
                                    </FormFeedback>
                                )}
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="mb-3">
                                <Label
                                    htmlFor="shippingAddress.city"
                                    className="form-label"
                                >
                                    Cidade
                                </Label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    id="shippingAddress.city"
                                    placeholder="Cidade"
                                    {...register('shippingAddress.city')}
                                    invalid={!!formState.errors?.shippingAddress?.city}
                                />
                                {formState.errors?.shippingAddress?.city && (
                                    <FormFeedback type="invalid">
                                        {formState.errors?.shippingAddress?.city.message}
                                    </FormFeedback>
                                )}
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4}>
                            <div className="mb-3">
                                <Label
                                    htmlFor="shippingAddress.number"
                                    className="form-label"
                                >
                                    Número
                                </Label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    id="shippingAddress.number"
                                    placeholder="Número"
                                    {...register('shippingAddress.number')}
                                    invalid={!!formState.errors?.shippingAddress?.number}
                                />
                                {formState.errors?.shippingAddress?.number && (
                                    <FormFeedback type="invalid">
                                        {formState.errors.shippingAddress.number.message}
                                    </FormFeedback>
                                )}
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="mb-3">
                                <Label htmlFor="shippingAddress.neighborhood" className="form-label">
                                    Bairro
                                </Label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    id="shippingAddress.neighborhood"
                                    placeholder="Bairro"
                                    {...register("shippingAddress.neighborhood")}
                                    invalid={!!formState.errors?.shippingAddress?.neighborhood}
                                />
                                {formState.errors?.shippingAddress?.neighborhood && (
                                    <FormFeedback type="invalid">
                                        {formState.errors.shippingAddress.neighborhood.message}
                                    </FormFeedback>
                                )}
                            </div>
                        </Col>

                        <Col md={4}>
                            <div className="mb-3">
                                <Label htmlFor="shippingAddress.state" className="form-label">
                                    Estado
                                </Label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    id="shippingAddress.state"
                                    placeholder="ES"
                                    {...register("shippingAddress.state")}
                                    invalid={!!formState.errors?.shippingAddress?.state}
                                />
                                {formState.errors?.shippingAddress?.state && (
                                    <FormFeedback type="invalid">
                                        {formState.errors.shippingAddress.state.message}
                                    </FormFeedback>
                                )}
                            </div>
                        </Col>
                    </Row>

                    {methodsShipping && (
                        <>
                            {methodsShipping?.map((shipping) => (
                                <Row key={shipping.methodId}>
                                    <Col md={12}>
                                        <div className="form-check card-radio mb-2">
                                            <Input
                                                id={shipping.methodId}
                                                name="type"
                                                type="radio"
                                                className="form-check-input"
                                                value={shipping.methodId}
                                                {...register('shippingAddress.shippingMethod')}
                                                invalid={!!formState.errors?.shippingAddress?.shippingMethod}
                                            />
                                            <Label
                                                className="form-check-label"
                                                htmlFor={shipping.methodId}
                                            >
                                                <span className="fs-16 text-muted me-2">
                                                    <i className="ri-bank-card-fill align-bottom"></i>
                                                </span>
                                                <span className="fs-14 text-wrap">
                                                    {shipping.name} - {shipping.deliveryTime} - {shipping.price > 0
                                                        ? formatNumberToReal(shipping.price)
                                                        : 'GRÁTIS'}
                                                </span>
                                            </Label>
                                        </div>
                                    </Col>
                                </Row>
                            ))}
                        </>
                    )}
                    {formState.errors?.shippingAddress?.shippingMethod && (
                        <FormFeedback type="invalid">
                            {formState.errors.shippingAddress?.shippingMethod?.message}
                        </FormFeedback>
                    )}
                </>


            )}

        </div>
    )
}