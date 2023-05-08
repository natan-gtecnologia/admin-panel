import {
    Col,
    FormFeedback,
    Label,
    Row,
} from '@growth/growforce-admin-ui/index';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { useFormContext } from 'react-hook-form';
import { CreateOrUpdateOrdersSchemaProps } from './schema';
import { useState } from 'react';
import { notNumberMask, creditCardMask, expirationDateMask, cvvMask } from 'apps/growforce/admin-panel/utils/masks';

export function PaymentMetod() {
    const { formState, register, watch, setValue } = useFormContext<CreateOrUpdateOrdersSchemaProps>();

    const typePayment = watch('payment.method');

    return (
        <>
            <Row className="g-4">
                <Col lg={6} sm={6}>
                    <div>
                        <div className="form-check card-radio">
                            <Input
                                id="pix"
                                name="type"
                                type="radio"
                                className="form-check-input"
                                value="pix"
                                {...register('payment.method')}
                            />
                            <Label
                                className="form-check-label"
                                htmlFor="pix"
                            >
                                <span className="fs-16 text-muted me-2">
                                    <i className="ri-pixelfed-line align-bottom"></i>
                                </span>
                                <span className="fs-14 text-wrap">
                                    Pix
                                </span>
                            </Label>
                        </div>
                    </div>
                </Col>
                <Col lg={6} sm={6}>
                    <div>
                        <div className="form-check card-radio">
                            <Input
                                id="credit_card"
                                name="type"
                                type="radio"
                                className="form-check-input"
                                value="credit_card"
                                {...register('payment.method')}
                            />
                            <Label
                                className="form-check-label"
                                htmlFor="credit_card"
                            >
                                <span className="fs-16 text-muted me-2">
                                    <i className="ri-bank-card-fill align-bottom"></i>
                                </span>
                                <span className="fs-14 text-wrap">
                                    Cartão de Crédito / Débito
                                </span>
                            </Label>
                        </div>
                    </div>
                </Col>

            </Row>

            {typePayment === 'credit_card' && (
                <div
                    className="collapse show"
                    id="paymentmethodCollapse"
                >
                    <Card className="p-4 border shadow-none mb-0 mt-4">
                        <Row className="gy-3">
                            <Col md={12}>
                                <Label htmlFor="creditCard.name" className="form-label">
                                    Nome no cartão
                                </Label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    id="creditCard.name"
                                    placeholder="Insira o nome"
                                    {...register('payment.creditCard.name', {
                                        required: true,
                                        onChange: (e) => {
                                            notNumberMask.onChange(e);
                                            setValue('payment.creditCard.name', notNumberMask.mask(e.target.value));
                                        },
                                    })}
                                    invalid={!!formState.errors?.payment?.creditCard?.name}
                                />
                                {formState.errors?.payment?.creditCard?.name && (
                                    <FormFeedback type="invalid">
                                        {formState.errors.payment?.creditCard?.name?.message}
                                    </FormFeedback>
                                )}

                                <small className="text-muted">
                                    Nome completo conforme exibido no cartão
                                </small>
                            </Col>

                            <Col md={6}>
                                <Label
                                    htmlFor="creditCard.number"
                                    className="form-label"
                                >
                                    Número do cartão de crédito
                                </Label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    id="creditCard.number"
                                    placeholder="xxxx xxxx xxxx xxxx"
                                    {...register('payment.creditCard.number', {
                                        onChange: creditCardMask.onChange
                                    })}
                                    invalid={!!formState.errors?.payment?.creditCard?.number}
                                />
                                {formState.errors?.payment?.creditCard?.number && (
                                    <FormFeedback type="invalid">
                                        {formState.errors.payment?.creditCard?.number?.message}
                                    </FormFeedback>
                                )}
                            </Col>

                            <Col md={3}>
                                <Label
                                    htmlFor="creditCard.expiry"
                                    className="form-label"
                                >
                                    Expiração
                                </Label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    id="creditCard.expiry"
                                    placeholder="MM/YY"
                                    {...register('payment.creditCard.expiry', {
                                        onChange: expirationDateMask.onChange
                                    })}
                                    invalid={!!formState.errors?.payment?.creditCard?.expiry}
                                />
                                {formState.errors?.payment?.creditCard?.expiry && (
                                    <FormFeedback type="invalid">
                                        {formState.errors.payment?.creditCard?.expiry?.message}
                                    </FormFeedback>
                                )}
                            </Col>

                            <Col md={3}>
                                <Label htmlFor="creditCard.cvc" className="form-label">
                                    CVV
                                </Label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    id="creditCard.cvc"
                                    placeholder="xxx"
                                    {...register('payment.creditCard.cvc', {
                                        onChange: cvvMask.onChange
                                    })}
                                    invalid={!!formState.errors?.payment?.creditCard?.cvc}
                                />
                                {formState.errors?.payment?.creditCard?.cvc && (
                                    <FormFeedback type="invalid">
                                        {formState.errors.payment?.creditCard?.cvc?.message}
                                    </FormFeedback>
                                )}
                            </Col>
                        </Row>
                    </Card>
                </div>
            )}
        </>
    )
}