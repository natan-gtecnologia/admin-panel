/* eslint-disable @next/next/no-img-element */
import { formatNumberToReal } from '@growth/core/util/formatting';
import Link from '@growth/growforce-admin-ui/components/Common/Link';
import { format } from 'date-fns';
import React from 'react';
import { IOrder } from '../../@types/order';
import { useSettings } from '../../contexts/SettingsContext';
import ptBR from 'date-fns/locale/pt-BR';
interface OrderProductProps {
  product: IOrder['items'][0];
}

const OrderProduct = ({ product }: OrderProductProps) => {
  if (!product.product) return null;
  const { config } = useSettings();

  const activationDate = product.metaData.find((item) => item.key === "activationDate")

  return (
    <>
      <tr>
        <td>
          <div className="d-flex">
            <div className="flex-shrink-0 avatar-md bg-light rounded p-1">
              {product.product?.data?.attributes?.images?.data?.length > 0 && (
                <img
                  src={
                    product.product.data.attributes?.images?.data?.[0]?.attributes
                      .formats?.small?.url ||
                    product.product.data.attributes?.images?.data?.[0]?.attributes?.url
                  }
                  alt=""
                  className="img-fluid d-block"
                />
              )}
            </div>
            <div className="flex-grow-1 ms-3 d-flex align-items-center">
              <h5 className="fs-15 ">
                <Link
                  href={`/products/view/${product.product.data.id}`}
                  className="link-primary"
                >
                  {product.name}
                </Link>
              </h5>
            </div>
          </div>
        </td>
        {config.custom_fields['activation_date'] && activationDate ? (
          <td>
            {format(
              new Date(activationDate?.valueString),
              'dd/MM/yyyy',
              {
                locale: ptBR,
              },
            )}
          </td>
        ) : (
          <td>
            Sem data de ativação
          </td>
        )}
        <td>
          {formatNumberToReal(product?.price?.salePrice)}
        </td>
        <td>{product?.quantity}</td>
        <td className="fw-medium text-end">
          {formatNumberToReal(
            product.price?.salePrice * product?.quantity
          )}
        </td>
      </tr>
    </>
  );
};

export default OrderProduct;
