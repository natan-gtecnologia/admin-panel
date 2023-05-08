/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  cepMask,
  formatNumberToReal,
  phoneMask,
} from '@growth/core/util/formatting';
import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Col, Row } from '@growth/growforce-admin-ui/index';
import { useState } from 'react';
import { Accordion } from 'reactstrap';
import { IOrder } from '../../@types/order';
import { useSettings } from '../../contexts/SettingsContext';
import OrderProduct from './OrderProduct';
import { OrderStatus } from './OrderStatus';
import { cnpjMask, cpfMask } from '../../utils/masks';
type OrderDetailsProps = {
  order: IOrder;
};
export function OrderDetails({ order }: OrderDetailsProps) {
  const [accordionTarget, setAccordionTarget] = useState('');
  const { config } = useSettings()

  const toggleAccordionTarget = (target: string) => {
    if (accordionTarget === target) {
      setAccordionTarget('');
    } else {
      setAccordionTarget(target);
    }
  };

  return (
    <Row>
      <Col md={8}>
        <Card>
          <Card.Header>
            <Row>
              <div className="d-flex align-items-center">
                <Col md={9}>
                  <h4 className="card-title mb-0">Pedido #{order.orderId}</h4>
                </Col>

                <Col md={3}>
                  {/*<div className="d-flex justify-content-end">
                    <Button color="success">
                      <i className="ri-file-download-line align-bottom me-2"></i>
                      Baixar Boleto
                    </Button>
                  </div>*/}
                </Col>
              </div>
            </Row>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive table-card">
              <table className="table table-nowrap align-middle table-borderless mb-0">
                <thead className="table-light text-muted">
                  <tr>
                    <th scope="col">Detalhes do produto</th>
                    {config.custom_fields['activation_date'] && (
                      <th scope="col">Data de ativação </th>
                    )}
                    <th scope="col">Preço do item </th>
                    <th scope="col">Quantidade</th>
                    <th scope="col" className="text-end">
                      Valor total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((product, key) => (
                    <OrderProduct product={product} key={key} />
                  ))}

                  <tr className="border-top border-top-dashed">
                    <td colSpan={3}></td>
                    <td colSpan={2} className="fw-medium p-0">
                      <table className="table table-borderless mb-0">
                        <tbody>
                          <tr>
                            <td>Sub Total :</td>
                            <td className="text-end">
                              {formatNumberToReal(order.totals.subTotal)}
                            </td>
                          </tr>
                          {order.coupons.map((coupon) => (
                            <tr key={coupon.code}>
                              <td>
                                Desconto{' '}
                                <span className="text-muted">
                                  ({coupon.code})
                                </span>
                                :
                              </td>
                              <td className="text-end">
                                {coupon.shippingType === 'free_shipping' ? (
                                  'Frete Grátis'
                                ) : (
                                  <>
                                    {coupon.discountType === 'percentage' ? (
                                      <>{coupon.discount}%</>
                                    ) : (
                                      <>
                                        {formatNumberToReal(
                                          coupon.discount * -1,
                                        )}
                                      </>
                                    )}
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                          <tr>
                            <td>Frete:</td>
                            <td className="text-end">
                              {order.coupons.some(
                                (coupon) =>
                                  coupon.shippingType === 'free_shipping',
                              ) ? (
                                'Grátis'
                              ) : (
                                <>{formatNumberToReal(order.totals.shipping)}</>
                              )}
                            </td>
                          </tr>
                          {/*<tr>
                            <td>Estimated Tax:</td>
                            <td className="text-end">$44.99</td>
                          </tr>*/}
                          <tr className="border-top border-top-dashed">
                            <th scope="row">Total:</th>
                            <th className="text-end">
                              {formatNumberToReal(order.totals.total)}
                            </th>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <div className="d-sm-flex align-items-center">
              <h5 className="card-title flex-grow-1 mb-0">Rastreamento</h5>
            </div>
          </Card.Header>

          <Card.Body>
            <div className="profile-timeline">
              <Accordion open={accordionTarget} flush>
                {order?.shipping?.trackingEvents?.map((event, key) => (
                  <OrderStatus
                    key={event.sk_event}
                    isOpen={accordionTarget === event.sk_event}
                    onToggle={toggleAccordionTarget}
                    trackingEvent={event}
                  />
                ))}
              </Accordion>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={4}>
        {order?.shipping && (
          <Card>
            <Card.Header>
              <Row>
                <div className="d-flex align-items-center">
                  <Col md={8}>
                    <div className="d-flex align-items-center">
                      <i className="ri-file-download-line align-bottom me-2"></i>
                      <h6 className="card-title mb-0">Detalhes da Logística</h6>
                    </div>
                  </Col>

                  <Col md={4}>
                    <div className="d-flex justify-content-end">
                      <span className="badge badge-soft-primary">
                        Acompanhar pedido
                      </span>
                    </div>
                  </Col>
                </div>
              </Row>
            </Card.Header>

            <Card.Body>
              <div className="text-center">
                <i
                  className="ri-truck-line align-bottom me-2"
                  style={{ fontSize: '40px' }}
                ></i>
                <h5 className="fs-16 mt-2">{order.shipping?.method}</h5>
                <p className="text-muted mb-0">
                  ID: {order.shipping?.trackingCode}
                </p>
                {/*<p className="text-muted mb-0">
                Forma de pagamento: {paymentMethods[order.payment?.method]}
              </p>*/}
              </div>
            </Card.Body>
          </Card>
        )}

        <Card>
          <Card.Header>
            <div className="d-flex">
              <h5 className="card-title flex-grow-1 mb-0">
                Detalhes do cliente
              </h5>
              {/*<div className="flex-shrink-0">
                <Link href={'#'} className="link-secondary">
                  Ver perfil
                </Link>
              </div>*/}
            </div>
          </Card.Header>
          <Card.Body>
            <ul className="list-unstyled mb-0 vstack gap-3">
              <li>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="avatar-sm rounded">
                      <span className="avatar-title bg-soft-primary text-primary rounded fs-5">
                        {order.customer?.firstName.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="fs-14 mb-1">
                      {order.customer?.firstName +
                        ' ' +
                        order.customer?.lastName}
                    </h6>
                    <p className="text-muted mb-0">Cliente</p>
                  </div>
                </div>
              </li>
              <li>
                <i className="ri-mail-line me-2 align-middle text-muted fs-16"></i>
                {order.customer?.email}
              </li>
              <li>
                <i className="ri-phone-line me-2 align-middle text-muted fs-16"></i>
                {phoneMask.mask(
                  `${order.customer.mobilePhone.areaCode}${order.customer.mobilePhone.number}`,
                )}
              </li>
              <li>
                <i className="ri-bank-card-2-line me-2 align-middle text-muted fs-16"></i>
                {order.customer?.documentType === "cpf" ? (
                  <>
                    {cpfMask.mask(order.customer?.document)}
                  </>
                ) : (
                  <>
                    {cnpjMask.mask(order.customer.document)}
                  </>
                )}
              </li>
            </ul>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h5 className="card-title mb-0">
              <i className="ri-map-pin-line align-middle me-1 text-muted"></i>{' '}
              Endereço de cobrança
            </h5>
          </Card.Header>
          <Card.Body>
            <ul className="list-unstyled vstack gap-2 fs-13 mb-0">
              <li className="fw-medium fs-14">
                {order.customer?.firstName + ' ' + order.customer?.lastName}
              </li>
              <li>
                {phoneMask.mask(
                  `${order.customer.mobilePhone.areaCode}${order.customer.mobilePhone.number}`,
                )}
              </li>
              {/*<li>
                {order.customer?.phone}
              </li>*/}
              <li>
                {order.billingAddress?.address1 +
                  ' - ' +
                  order.billingAddress?.number}
              </li>
              <li>
                {order.billingAddress?.city} -{' '}
                {cepMask.mask(order.billingAddress?.postCode ?? '')}
              </li>
              <li>
                {order.billingAddress?.state} - {order.billingAddress?.country}
              </li>
            </ul>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h5 className="card-title mb-0">
              <i className="ri-map-pin-line align-middle me-1 text-muted"></i>{' '}
              Endereço de entrega
            </h5>
          </Card.Header>
          <Card.Body>
            <ul className="list-unstyled vstack gap-2 fs-13 mb-0">
              <li className="fw-medium fs-14">
                {order.customer?.firstName + ' ' + order.customer?.lastName}
              </li>
              <li>
                {order.shippingAddress?.address1 +
                  ' - ' +
                  order.shippingAddress?.number}
              </li>
              <li>
                {order.shippingAddress?.city} -{' '}
                {cepMask.mask(order.shippingAddress?.postCode ?? '')}
              </li>
              <li>
                {order.shippingAddress?.state} -{' '}
                {order.shippingAddress?.country}
              </li>
            </ul>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h5 className="card-title mb-0">
              <i className="ri-secure-payment-line align-bottom me-1 text-muted"></i>{' '}
              Detalhes de pagamento
            </h5>
          </Card.Header>
          <Card.Body>
            <div className="d-flex align-items-center mb-2">
              <div className="flex-shrink-0">
                <p className="text-muted mb-0">ID Pagamento:</p>
              </div>
              <div className="flex-grow-1 ms-2">
                <h6 className="mb-0">{order.paymentId}</h6>
              </div>
            </div>
            {order.payment.method === 'pix' &&
              order.payment.code &&
              order.payment.code.trim() !== '' && (
                <div className="flex align-items-center mb-2">
                  <div className="flex-shrink-0">
                    <p className="text-muted mb-0">Código pix:</p>
                  </div>
                  <div className="flex-grow-1 ms-2">
                    <h6 className="mb-0">{order.payment.code}</h6>
                  </div>
                </div>
              )}

            {/*<div className="d-flex align-items-center mb-2">
              <div className="flex-shrink-0">
                <p className="text-muted mb-0">Card Holder Name:</p>
              </div>
              <div className="flex-grow-1 ms-2">
                <h6 className="mb-0">Joseph Parker</h6>
              </div>
            </div>
            <div className="d-flex align-items-center mb-2">
              <div className="flex-shrink-0">
                <p className="text-muted mb-0">Card Number:</p>
              </div>
              <div className="flex-grow-1 ms-2">
                <h6 className="mb-0">xxxx xxxx xxxx 2456</h6>
              </div>
            </div>*/}

            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <p className="text-muted mb-0">Valor total:</p>
              </div>
              <div className="flex-grow-1 ms-2">
                <h6 className="mb-0">
                  {formatNumberToReal(order.totals.total)}
                </h6>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
