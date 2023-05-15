import { Card } from "@/components/Common/Card";
import { Button } from "reactstrap";

import type { IProduct } from "@/@types/product";
import TableContainer from "@/components/Common/TableContainer";
import Image from "next/image";
import { useCallback, useMemo } from "react";
import type { CellProps } from "react-table";
import { CreateOrUpdateSchemaType } from "../../CreateOrUpdate/schema";

import { ILiveStream } from "@/@types/livestream";
import { Tooltip } from "@/components/Common/Tooltip";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { api } from "@/services/apiClient";
import { queryClient } from "@/services/react-query";
import { currentPrice, discountPercentage } from "@/utils/price";
import { formatNumberToReal } from "@growthventure/utils/lib/formatting/format";
import { InsertProductModal } from "../../CreateOrUpdate/InsertProductModal";

type ProductProps = CreateOrUpdateSchemaType["products"][number] & {
  product: IProduct
  steam_product_id: number;
};

interface Props {
  products: ProductProps[]
  liveId: number;
}

export function HighlightedProducts({ products, liveId }: Props) {
  const handleInsertNewProducts = useCallback(async (ids: number[]) => {
    try {
      await api.put(`/live-streams/${liveId}`, {
        data: {
          streamProducts: products.map(product => ({
            id: product.steam_product_id,
            ...(ids.includes(product.id) && {
              highlight: true
            })
          }))
        }
      })

      queryClient.setQueryData<ILiveStream | undefined>(
        ["liveStream", 'room', liveId], (oldData) => {
          if (!oldData)
            return;

          return {
            ...oldData,
            streamProducts: oldData.streamProducts.map(streamProduct => ({
              ...streamProduct,
              ...(ids.includes(streamProduct.product.id) && {
                highlight: true
              })
            }))
          };
        }
      )
    } catch (error) {

    }
  }, [liveId, products])

  const handleRemoveFromHighlight = useCallback(async (product_id: number) => {
    try {
      await api.put(`/live-streams/${liveId}`, {
        data: {
          streamProducts: products.map(product => ({
            id: product.steam_product_id,
            ...(product.id === product_id && {
              highlight: false
            })
          }))
        }
      })

      queryClient.setQueryData<ILiveStream | undefined>(
        ["liveStream", 'room', liveId], (oldData) => {
          if (!oldData)
            return;

          return {
            ...oldData,
            streamProducts: oldData.streamProducts.map(streamProduct => ({
              ...streamProduct,
              ...(streamProduct.product.id === product_id && {
                highlight: false
              })
            }))
          };
        }
      )
    } catch (error) {

    }
  }, [liveId, products])

  const columns = useMemo(
    () => [
      {
        Header: "Foto do produto",
        Cell: (cellProps: CellProps<ProductProps>) => {
          return (
            <div className="form-check form-switch">
              <Image
                src={cellProps.row.original.product.product_image.src}
                alt=""
                width={32}
                height={32}
                loading="lazy"
                style={{
                  borderRadius: 4,
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            </div>
          );
        },
        id: "#picture",
        width: "10%",
      },
      {
        Header: "Nome do Produto",
        Cell: (cellProps: CellProps<ProductProps>) => {
          return cellProps.row.original.product.title;
        },
        id: "#name",
      },
      {
        Header: "Preço Original",
        Cell: (cellProps: CellProps<ProductProps>) => {
          const price = currentPrice({
            regular_price: cellProps.row.original.product.price.regularPrice,
            price:
              cellProps.row.original.product.price?.salePrice ??
              cellProps.row.original.product.price.regularPrice,
          });
          return formatNumberToReal(price.price);
        },
        id: "#price",
        width: "10%",
      },
      {
        Header: "Desconto",
        Cell: (cellProps: CellProps<ProductProps>) => {
          const price = currentPrice({
            regular_price: cellProps.row.original.product?.price.regularPrice,
            price:
              cellProps.row.original.product?.price?.salePrice ??
              cellProps.row.original.product?.price?.regularPrice,
          });

          return (
            discountPercentage(
              price.price,
              cellProps.row.original.livePrice
            ).toString() + "%"
          );
        },
        id: "#discount",
        width: "10%",
      },
      {
        Header: "Preço da live",
        Cell: (cellProps: CellProps<ProductProps>) => {
          return formatNumberToReal(cellProps.row.original.livePrice);
        },
        id: "#livePrice",
        width: "10%",
      },
      {
        Header: "Ações",
        Cell: (cellProps: CellProps<ProductProps>) => {
          return (
            <div className="d-flex align-items-center gap-1">
              <ConfirmationModal
                changeStatus={async () => await handleRemoveFromHighlight(
                  cellProps.row.original.id
                )}
                title="Remover produto"
                message="Deseja realmente remover este produto? A ação não poderá ser desfeita e qualquer alteração será cancelada."
              >
                <button
                  type="button"
                  className="d-flex align-items-center gap-2 border-0 bg-transparent text-danger"
                >
                  <Tooltip message="Remover produto">
                    <span className="bx bxs-x-circle fs-5" />
                  </Tooltip>
                </button>
              </ConfirmationModal>
            </div>
          );
        },
        id: "#actions",
        width: "8%",
      },
    ],
    [handleRemoveFromHighlight]
  );

  return (
    <Card className="shadow-none">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <h4 className="card-title mb-0 fw-bold">
          Produtos em destaque (Máx. 4)
        </h4>

        <InsertProductModal onSelect={handleInsertNewProducts} products={products.filter(product => !product.highlighted).map(product => product.product)}>
          <Button
            color="primary"
            className="d-flex align-items-center gap-2"
            disabled={products.filter(product => product.highlighted).length === 4}
            type="button"
          >
            <span className="bx bx-plus fs-5" />
            Inserir produto destaque
          </Button>
        </InsertProductModal>
      </Card.Header>

      <Card.Body>
        <TableContainer
          columns={columns}
          data={products.filter(product => product.highlighted)}
          customPageSize={10}
          divClass="table-responsive mb-1"
          tableClass="mb-0 align-middle table-borderless"
          theadClass="table-light text-muted"
          hidePagination
        />
      </Card.Body>
    </Card>
  );
}
