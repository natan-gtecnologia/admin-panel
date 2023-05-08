import { Card } from "@growth/growforce-admin-ui/components/Common/Card";
import { IProduct } from "apps/growforce/admin-panel/@types/product";
import Link from "next/link";
import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { CreateOrUpdateOrdersSchemaProps } from "./schema";
import { MethodShippingProps } from "./ShippingInformation";

interface IOrderSummary {
    products: IProduct[];
    methodsShipping: MethodShippingProps[];
}

export function OrderSummary({ products, methodsShipping }: IOrderSummary) {
    const { watch } = useFormContext<CreateOrUpdateOrdersSchemaProps>();
    const fieldsWatch = watch('items.items');
    const shippingMethod = watch('shippingAddress.shippingMethod');

    const shippingInfo = methodsShipping.find((item) => item.methodId === shippingMethod);

    return (
        <Card>
            <Card.Header>
                <div className="d-flex">
                    <div className="flex-grow-1">
                        <h5 className="card-title mb-0">Resumo do pedido</h5>
                    </div>
                </div>
            </Card.Header>
            <Card.Body>
                <div className="table-responsive table-card">
                    <table className="table table-borderless align-middle mb-0">
                        <thead className="table-light text-muted">
                            <tr>
                                <th style={{ width: "90px" }} scope="col">
                                    Produto
                                </th>
                                <th scope="col">Informações do produto</th>
                                <th scope="col" className="text-end">
                                    Preço
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {(fieldsWatch || []).map((field, key) => {
                                const product = products.find((product) => product.id === field.product)
                                const salePrice = product?.price?.salePrice ? product?.price.salePrice : product?.price.regularPrice

                                return (
                                    <React.Fragment key={key}>
                                        <tr>
                                            <td>
                                                {product?.images?.data?.length > 0 && (
                                                    <img
                                                        src={
                                                            product?.images?.data?.[0]?.attributes?.formats?.small?.url ||
                                                            product?.images?.data?.[0]?.attributes?.url
                                                        }
                                                        alt=""
                                                        className="img-fluid d-block"
                                                    />
                                                )}
                                            </td>
                                            <td>
                                                <h5 className="fs-14">
                                                    <Link
                                                        href=""
                                                        className="text-dark"
                                                    >
                                                        {product?.title}
                                                    </Link>
                                                </h5>
                                                <p className="text-muted mb-0">
                                                    R$ {salePrice} x {field.quantity}
                                                </p>
                                            </td>
                                            <td className="text-end">R$ {salePrice * field.quantity}</td>
                                        </tr>
                                    </React.Fragment>
                                )
                            }
                            )}
                        </tbody>
                    </table>
                </div>

                {shippingInfo && (
                    <div className="table-responsive table-card mt-4">
                        <table className="table table-borderless align-middle mb-0">
                            <thead className="table-light text-muted">
                                <tr>
                                    <th scope="col">
                                        Informações de envio
                                    </th>
                                    <th scope="col">
                                        Prazo
                                    </th>
                                    <th scope="col" className="text-end">
                                        Valor
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="fs-14">
                                        {shippingInfo?.name}
                                    </td>
                                    <td className="fs-14">
                                        {shippingInfo?.deliveryTime}
                                    </td>
                                    <td className="text-end">
                                        R$ {shippingInfo?.price}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

            </Card.Body>
        </Card>
    )
}