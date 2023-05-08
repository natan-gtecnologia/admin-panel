import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import {
    Form,
    Row,
    Col,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
} from "reactstrap";
import { zodResolver } from '@hookform/resolvers/zod';

import {
    FormProvider,
    SubmitHandler,
    useFieldArray,
    useForm,
} from 'react-hook-form';

import classnames from "classnames";
import { CreateOrUpdateOrdersSchemaProps, ordersSchema } from "./schema";
import { api } from "apps/growforce/admin-panel/services/apiClient";
import { ProductsType } from "./ProductsType";
import { Identification } from "./Identification";
import { PaymentMetod } from "./PaymentMetod";
import { useMutation } from "@tanstack/react-query";
import { useLayout } from "@growth/growforce-admin-ui/hooks/useLayout";
import { MethodShippingProps, ShippingInformation } from "./ShippingInformation";
import { cpfMask, creditCardMask } from "apps/growforce/admin-panel/utils/masks";
import { MetaData } from "apps/growforce/admin-panel/@types/strapi";
import { toast } from "react-toastify";
import { OrderSummary } from "./OrderSummary";
import { IProduct } from "apps/growforce/admin-panel/@types/product";
import QueryString from "qs";
import { convert_product_strapi } from "apps/growforce/admin-panel/utils/convertions/convert_product";
import { cepMask } from "@growth/core/util/formatting";
import { IOrder } from "apps/growforce/admin-panel/@types/order";
import Image from "next/image";

const CreateOrEditOrders = () => {
    const [activeTab, setActiveTab] = useState(1);
    const [passedSteps, setPassedSteps] = useState([1]);
    const [products, setProducts] = useState<IProduct[]>([]);
    const [responseOrders, setResponseOrders] = useState<IOrder>()
    const [methodsShipping, setMethodsShipping] = useState<MethodShippingProps[]>([]);

    const { handleChangeLoading } = useLayout();

    const form = useForm<CreateOrUpdateOrdersSchemaProps>({
        resolver: zodResolver(ordersSchema),
        mode: 'all',
        reValidateMode: 'onChange',
        defaultValues: {
            shippingAddress: {
                optionShipping: 'withdraw_now',
                address1: "",
                address2: "",
                city: "",
                neighborhood: "",
                country: "",
                number: "",
                postCode: "",
                state: "",
            },
            identity: {
                phone: "",
                email: "",
                firstName: "",
                lastName: "",
                billingAddress: {
                    address1: "",
                    address2: "",
                    city: "",
                    neighborhood: "",
                    country: "",
                    number: "",
                    postCode: "",
                    state: "",
                },
            },
            items: {
                items: []
            },
            payment: {
                method: "pix",
                creditCard: {
                    cvc: '',
                    expiry: '',
                    installments: 1,
                    name: '',
                    number: '',
                }
            }
        }
    });

    const { handleSubmit, setError, watch, trigger, clearErrors, reset, setValue } = form;
    const itemsWatch = watch('items.items');
    const optionShippingWatch = watch('shippingAddress.optionShipping');
    const paymentMethodWatch = watch('payment.method');
    const onCopyToastRef = useRef(null);

    async function toggleTab(tab: number): Promise<void> {
        const shipping = await trigger('shippingAddress');
        const payment = await trigger('payment');

        if (!itemsWatch?.length) {
            setError(`items`, {
                type: 'required',
                message: 'Preencha as informações corretamente, o minimo deve ser 1 item',
            });
            return;
        }

        if (tab === 3) {
            const identity = await trigger('identity');

            if (activeTab === 2 && !identity && tab > activeTab) {
                toast.info('Existem campo obrigatórios para serem preenchidos');
                return;
            }
        }

        if (optionShippingWatch === 'withdraw_now') {
            clearErrors('shippingAddress');
        }
        if (paymentMethodWatch === 'pix') {
            clearErrors('payment.creditCard');
        }

        if (activeTab === 3 && !shipping && tab > activeTab) {
            toast.info('Existem campo obrigatórios para serem preenchidos');
            return;
        }

        if (activeTab === 4 && !payment && tab > activeTab) {
            toast.info('Existem campo obrigatórios para serem preenchidos');
            return;
        }

        if (activeTab !== tab) {
            const modifiedSteps = [...passedSteps, tab];

            if (tab >= 1 && tab <= 5) {
                setActiveTab(tab);
                setPassedSteps(modifiedSteps);
            }
        }
    }

    const { mutateAsync: handleCreateOrUpdateOrder } = useMutation(
        async (data: CreateOrUpdateOrdersSchemaProps) => {

            try {
                handleChangeLoading({
                    description: 'Salvando pedido',
                    title: 'Carregando',
                });

                const customerPhone = String(data.identity.phone).split(' ');
                const ADDRESSES = {
                    billingAddress: {
                        ...data.identity.billingAddress,
                        postCode: cepMask.unmask(data.identity?.billingAddress?.postCode),
                        country: data.identity?.billingAddress?.country || "BR",
                    },
                    shippingAddress: {
                        number: data.shippingAddress?.number,
                        address1: data.shippingAddress?.address1,
                        address2: data.shippingAddress?.address2,
                        city: data.shippingAddress?.city,
                        neighborhood: data.shippingAddress?.neighborhood,
                        country: data.shippingAddress?.country || "BR",
                        state: data.shippingAddress?.state,
                        postCode: cepMask.unmask(data.shippingAddress?.postCode)
                    },
                }

                await api.patch('/carts', {
                    data: {
                        ...ADDRESSES,
                        customer: {
                            firstName: data.identity?.firstName,
                            lastName: data.identity?.lastName,
                            email: data.identity?.email,
                            birthDate: data.identity?.birthDate,
                            document: cpfMask.unmask(data.identity?.cpf),
                            documentType: 'cpf',
                            mobilePhone: {
                                countryCode: '55',
                                areaCode: customerPhone[0]?.replace(/[^0-9.]/g, ''),
                                number: `${customerPhone[1]}${customerPhone[2]}`?.replace(
                                    /\D+/g,
                                    '',
                                ),
                            },
                            homePhone: {
                                countryCode: '55',
                                areaCode: customerPhone[0]?.replace(/[^0-9.]/g, ''),
                                number: `${customerPhone[1]}${customerPhone[2]}`?.replace(
                                    /\D+/g,
                                    '',
                                ),
                            },
                            address: ADDRESSES.billingAddress,
                        },
                        items: data.items?.items.map(item => {
                            const metaData: Omit<MetaData, 'id'>[] = [];

                            if (item.activation_date) {
                                metaData.push({
                                    key: 'activationDate',
                                    valueString: String(item.activation_date)
                                })
                            }

                            return {
                                ...item,
                                productId: item.product,
                                metaData
                            }
                        }),
                        shippingMethod: data.shippingAddress?.shippingMethod,
                    }
                })
                
                const paymentMethod = data.payment.method;
                const responseOrders = await api.post('/orders', {
                    data: {
                        ...ADDRESSES,
                        payment: {
                            method: paymentMethod,
                            ...(paymentMethod === 'pix' && {
                                pix: {
                                    expiresIn: String(30 * 60), // 5 minutes in seconds
                                },
                            }),
                            ...(paymentMethod === 'credit_card' && {
                                credit_card: {
                                    card_expiration_date: data.payment.creditCard.expiry.replace('/', ''),
                                    card_number: creditCardMask.unmask(
                                        String(data.payment.creditCard.number),
                                    ),
                                    card_cvv: data.payment.creditCard.cvc,
                                    card_holder_name: data.payment.creditCard.name,
                                },
                                installments: String(
                                    data.payment.creditCard.installments,
                                ),
                            })
                        }
                    },
                });

                setResponseOrders(responseOrders.data);
                toggleTab(activeTab + 1);
                reset();
                setValue('items.items', [])
            } catch (error) {
                await api.patch('/carts', {
                    data: {
                        items: data.items?.items.map(item => {
                            const metaData: Omit<MetaData, 'id'>[] = [];

                            if (item.activation_date) {
                                metaData.push({
                                    key: 'activationDate',
                                    valueString: String(item.activation_date)
                                })
                            }
                            return {
                                ...item,
                                method: 'remove',
                                productId: item.product,
                                metaData
                            }
                        }),
                    }
                })
                toggleTab(activeTab);
                toast.error('Ocorreu um erro ao finalizar o pedido')
            } finally {
                handleChangeLoading(null);
            }
        },
    );

    function copyToClipboard() {
        const input = onCopyToastRef.current;
        if (input) {
            input.select();
            navigator.clipboard.writeText(input.value);
        }

        toast.info('Código copiado')
    }

    const onCreateOrUpdateSubmit: SubmitHandler<
        CreateOrUpdateOrdersSchemaProps
    > = async (data) => {
        await handleCreateOrUpdateOrder(data);
    };

    useEffect(() => {
        async function fetch() {
            const DEFAULT_PARAMS = {
                populate: '*',
                publicationState: 'preview',
                pagination: {
                    pageSize: 100,
                },
            };

            const productsResponse = await api.get('/products', {
                params: DEFAULT_PARAMS,
                paramsSerializer: (params) => {
                    return QueryString.stringify(params);
                },
            });

            setProducts(productsResponse.data.data.map(convert_product_strapi) || []);
        }
        fetch();
    }, []);

    return (
        <>
            <FormProvider
                {...form}
            >
                <Form onSubmit={handleSubmit(onCreateOrUpdateSubmit, console.log)}>
                    <Row>
                        <Col xl="8">
                            <Card>
                                <Card.Body className="checkout-tab">
                                    <div className="step-arrow-nav mt-n3 mx-n3 mb-3">
                                        <Nav
                                            className="nav-pills nav-justified custom-nav"
                                            role="tablist"
                                        >
                                            <NavItem role="products">
                                                <NavLink href='#'
                                                    className={classnames({ active: activeTab === 1, done: (activeTab <= 5 && activeTab >= 0) }, "fs-15 p-3")}
                                                    onClick={() => { toggleTab(1); }}
                                                >
                                                    <i className="ri-menu-add-line fs-16 p-2 bg-soft-primary text-primary rounded-circle align-middle me-2"></i>
                                                    Produtos
                                                </NavLink>
                                            </NavItem>
                                            <NavItem role="presentation">
                                                <NavLink href='#'
                                                    className={classnames({ active: activeTab === 2, done: (activeTab <= 5 && activeTab >= 1) }, "fs-15 p-3")}
                                                    onClick={() => { toggleTab(2); }}
                                                >
                                                    <i className="ri-user-2-line fs-16 p-2 bg-soft-primary text-primary rounded-circle align-middle me-2"></i>
                                                    Identificação
                                                </NavLink>
                                            </NavItem>
                                            <NavItem role="presentation">
                                                <NavLink href='#'
                                                    className={classnames({ active: activeTab === 3, done: activeTab <= 5 && activeTab > 2 }, "fs-15 p-3")}
                                                    onClick={() => { toggleTab(3); }}
                                                >
                                                    <i className="ri-truck-line fs-16 p-2 bg-soft-primary text-primary rounded-circle align-middle me-2"></i>
                                                    Envio
                                                </NavLink>
                                            </NavItem>
                                            <NavItem role="presentation">
                                                <NavLink href='#'
                                                    className={classnames({ active: activeTab === 4, done: activeTab <= 5 && activeTab > 3 }, "fs-15 p-3")}
                                                    onClick={() => { toggleTab(4) }}
                                                >
                                                    <i className="ri-bank-card-line fs-16 p-2 bg-soft-primary text-primary rounded-circle align-middle me-2"></i>
                                                    Pagamento
                                                </NavLink>
                                            </NavItem>
                                            <NavItem role="presentation">
                                                <NavLink
                                                    className={classnames({ done: activeTab <= 5 && activeTab > 4 }, "fs-15 p-3")}
                                                >
                                                    <i className="ri-checkbox-circle-line fs-16 p-2 bg-soft-primary text-primary rounded-circle align-middle me-2"></i>
                                                    Finalizar
                                                </NavLink>
                                            </NavItem>
                                        </Nav>
                                    </div>

                                    <TabContent activeTab={activeTab}>
                                        <TabPane tabId={1} id="pills-bill-info">
                                            <div>
                                                <h5 className="mb-1">Produto</h5>
                                                <p className="text-muted mb-4">
                                                    Por favor, preencha todas as informações abaixo
                                                </p>
                                            </div>

                                            <ProductsType products={products} />

                                            <div className="d-flex align-items-start gap-3 mt-3">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-label right ms-auto nexttab"
                                                    onClick={() => {
                                                        toggleTab(activeTab + 1)
                                                    }}
                                                >
                                                    <i className="ri-user-fill label-icon align-middle fs-16 ms-2"></i>
                                                    Ir para identificação
                                                </button>
                                            </div>

                                        </TabPane>
                                        <TabPane tabId={2} id="pills-bill-info">
                                            <div>
                                                <h5 className="mb-1">Informações de pagamento</h5>
                                                <p className="text-muted mb-4">
                                                    Por favor, preencha todas as informações abaixo
                                                </p>
                                            </div>

                                            <Identification />

                                            <div className="d-flex align-items-start gap-3 mt-3">
                                                <button
                                                    type="button"
                                                    className="btn btn-light btn-label previestab"
                                                    onClick={() => {
                                                        toggleTab(activeTab - 1);
                                                    }}
                                                >
                                                    <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>
                                                    Voltar para produtos
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-label right ms-auto nexttab"
                                                    onClick={() => {
                                                        toggleTab(activeTab + 1);
                                                    }}
                                                >
                                                    <i className="ri-truck-line label-icon align-middle fs-16 ms-2"></i>
                                                    Ir para o envio
                                                </button>
                                            </div>
                                        </TabPane>

                                        <TabPane tabId={3}>
                                            <div>
                                                <h5 className="mb-1">Informações de Envio</h5>
                                                <p className="text-muted mb-4">
                                                    Por favor, preencha todas as informações abaixo
                                                </p>
                                            </div>

                                            <ShippingInformation products={products} methodsShipping={methodsShipping} setMethodsShipping={setMethodsShipping} />

                                            <div className="d-flex align-items-start gap-3 mt-4">
                                                <button
                                                    type="button"
                                                    className="btn btn-light btn-label previestab"
                                                    onClick={() => {
                                                        toggleTab(activeTab - 1);
                                                    }}
                                                >
                                                    <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>
                                                    Voltar para identificação
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-label right ms-auto nexttab"
                                                    onClick={() => {
                                                        toggleTab(activeTab + 1);
                                                    }}
                                                >
                                                    <i className="ri-bank-card-line label-icon align-middle fs-16 ms-2"></i>
                                                    Ir para o pagamento
                                                </button>
                                            </div>
                                        </TabPane>

                                        <TabPane tabId={4}>
                                            <div>
                                                <h5 className="mb-1">Método de pagamento</h5>
                                                <p className="text-muted mb-4">
                                                    Selecione e insira suas informações de cobrança
                                                </p>
                                            </div>

                                            <PaymentMetod />

                                            <div className="d-flex align-items-start gap-3 mt-4">
                                                <button
                                                    type="button"
                                                    className="btn btn-light btn-label previestab"
                                                    onClick={() => {
                                                        toggleTab(activeTab - 1);
                                                    }}
                                                >
                                                    <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>
                                                    Voltar para envio
                                                </button>

                                                <button
                                                    type="submit"
                                                    className="btn btn-primary btn-label right ms-auto nexttab"
                                                >
                                                    <i className="ri-shopping-basket-line label-icon align-middle fs-16 ms-2"></i>
                                                    Finalizar Pedido
                                                </button>
                                            </div>
                                        </TabPane>

                                        <TabPane tabId={5} id="pills-finish">
                                            {responseOrders && responseOrders.payment.method === 'pix' ? (
                                                <Row>
                                                    <Col md={7} className="text-center py-5 d-flex flex-column justify-content-center">
                                                        <h5>Obrigado! Seu pedido está quase concluído!</h5>
                                                        <p className="text-muted">
                                                            Para finalizar o seu pedido abra seu aplicativo, vá até a área
                                                            Pix, <br /> leia o QR Code e efetue o seu pagamento
                                                        </p>
                                                    </Col>

                                                    <Col md={5}>
                                                        <div>
                                                            <Image
                                                                src={String(responseOrders.payment?.qrCode)}
                                                                width={200}
                                                                height={200}
                                                                alt="qrcode"
                                                                loading="lazy"
                                                            />
                                                        </div>

                                                        <div className="input-group">
                                                            <p>
                                                                Caso prefira, copie e cole o código de pagamento abaixo na
                                                                área Pix do aplicativo do seu banco.
                                                            </p>
                                                            <input
                                                                ref={onCopyToastRef}
                                                                readOnly
                                                                defaultValue={responseOrders?.payment.code}
                                                                disabled
                                                                className="form-control"
                                                            />
                                                            <button className="btn btn-success" type="button" onClick={copyToClipboard}>Copiar</button>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            ) : (
                                                <>
                                                    <div className="text-center py-5">
                                                        <h5>Obrigado! Seu pedido está concluído!</h5>
                                                        <p className="text-muted">
                                                            Você receberá um e-mail de confirmação do pedido com
                                                            detalhes do seu pedido.
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                            <Row>
                                                <Col md={3}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-light btn-label previestab"
                                                        onClick={() => {
                                                            setActiveTab(1);
                                                        }}
                                                    >
                                                        <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>
                                                        Voltar para o inicio
                                                    </button>
                                                </Col>
                                            </Row>
                                        </TabPane>
                                    </TabContent>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xl={4}>
                            <OrderSummary products={products} methodsShipping={methodsShipping} />
                        </Col>
                    </Row>
                </Form>
            </FormProvider>
        </>
    );
};

export default CreateOrEditOrders;