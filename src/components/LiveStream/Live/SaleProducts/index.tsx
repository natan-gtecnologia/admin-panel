import { Card } from "@/components/Common/Card";
import { Button, Input } from "reactstrap";

import type { IProduct } from "@/@types/product";
import TableContainer from "@/components/Common/TableContainer";
import Image from "next/image";
import { useCallback, useMemo } from "react";
import type { CellProps } from "react-table";
// import type { CreateOrUpdateSchemaType } from "../schema";

import { ILiveStream } from "@/@types/livestream";
// import { Input } from "@/components/Common/Form/Input";
import { Tooltip } from "@/components/Common/Tooltip";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { api } from "@/services/apiClient";
import { queryClient } from "@/services/react-query";
import { currentPrice, discountPercentage } from "@/utils/price";
import { MetaData } from "@growthventure/utils";
import { formatNumberToReal } from "@growthventure/utils/lib/formatting/format";
import { InsertProductModal } from "../../CreateOrUpdate/InsertProductModal";
import { CreateOrUpdateSchemaType } from "../../CreateOrUpdate/schema";
import { ChangeDiscountModal } from "./ChangeDiscountModal";

type ProductProps = CreateOrUpdateSchemaType["products"][number] & {
  product: IProduct
  steam_product_id: number;
  metaData: MetaData
};
interface SaleProductProps {
  products: ProductProps[]
  liveId: number;
  liveUUID: string;
}

export function SaleProducts({ products, liveId, liveUUID }: SaleProductProps) {
  const handleAddToLiveProducts = useCallback(async (ids: number[], productsToSave?: IProduct[]) => {
    try {
      if (!productsToSave) return;

      const currentProducts = products.map(product => ({
        id: product.steam_product_id
      }));

      const newProducts = productsToSave
        .filter((product) => {
          return ids.includes(product.id);
        })
        .map((product) => ({
          product: product.id,
          price: {
            regularPrice: product.price?.regularPrice,
            salePrice: product.price?.salePrice ?? product.price?.regularPrice,
          },
          highlight: false,
        }));

      await api.put(`/live-streams/${liveId}`, {
        data: {
          streamProducts: [...currentProducts, ...newProducts]
        }
      })

      await queryClient.invalidateQueries(
        ["liveStream", 'room', liveId]
      )
    } catch (error) {

    }
  }, [liveId, products]);

  const handleUpdatedProductDiscount = useCallback(async (product_id: number, new_price: number) => {
    try {
      const findedProduct = products.findIndex(
        product => product.id === product_id
      )

      if (findedProduct === -1) return;

      await api.put(`/live-streams/${liveId}`, {
        data: {
          streamProducts: products.map(product => ({
            id: product.steam_product_id,
            ...(
              product.id === product_id && {
                price: {
                  regularPrice: product.product.price.regularPrice,
                  salePrice: new_price
                }
              }
            )
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
                price: {
                  regularPrice: streamProduct.price.regularPrice,
                  salePrice: new_price
                }
              })
            }))
          };
        }
      )
    } catch (error) {

    }
  }, [liveId, products])

  const handleDeleteProductFromLive = useCallback(async (product_id: number) => {
    try {
      const findedProduct = products.findIndex(
        product => product.id === product_id
      )

      if (findedProduct === -1) return;

      await api.put(`/live-streams/${liveId}`, {
        data: {
          streamProducts: products.filter(product => product.id !== product_id).map(product => ({
            id: product.steam_product_id,
          }))
        }

      })

      queryClient.setQueryData<ILiveStream | undefined>(
        ["liveStream", 'room', liveId], (oldData) => {
          if (!oldData)
            return;

          return {
            ...oldData,
            streamProducts: oldData.streamProducts.filter(
              streamProduct => streamProduct.product.id !== product_id
            )
          };
        }
      )
    } catch (error) {

    }
  }, [liveId, products])

  const handleChangeDelay = useCallback(async (type: 'add' | 'remove', stream_product_id: number, currentStep: number) => {
    if (currentStep <= 5 && type === 'remove') return

    const newValue = type === 'add' ? currentStep + 5 : currentStep - 5

    const currentProducts = products.map(product => ({
      id: product.steam_product_id,
      ...(product.steam_product_id === stream_product_id && {
        metaData: {
          key: 'delayTime',
          valueInteger: newValue
        }
      })
    }));

    try {
      await api.put(`/live-streams/${liveId}`, {
        data: {
          streamProducts: currentProducts
        }
      });

      queryClient.setQueryData<ILiveStream | undefined>(
        ["liveStream", 'room', liveId], (oldData) => {
          if (!oldData)
            return;

          return {
            ...oldData,
            streamProducts: oldData.streamProducts.map((product) => {
              return {
                ...product,
                ...(product.id === stream_product_id && {
                  metaData: {
                    ...product.metaData,
                    key: 'delayTime',
                    valueInteger: newValue
                  }
                })
              }
            })
          };
        }
      )

    } catch (error) {

    }

  }, [liveId, products]);

  const handleStartPreview = useCallback(async (product: ProductProps) => {
    const valueStep = product.metaData.valueInteger || 5;

    try {
      await api.post('/live-streams/send-metadata', {
        uuid: liveUUID,
        productId: product.id,
        delayTime: valueStep
      })
    } catch (error) {
      console.log(error)
    }

  }, [liveUUID]);

  const columns = useMemo(
    () => [
      //{
      //  Header: (
      //    <div className="form-check form-switch d-flex justify-content-center flex-1 align-items-center">
      //      <Label className="form-check-label me-1" for="SwitchCheck1">
      //        Ativar todos
      //      </Label>

      //      <Input
      //        className="form-check-input"
      //        type="checkbox"
      //        role="switch"
      //        id="SwitchCheck1"
      //        checked={selectedIds === "all"}
      //        onChange={() => {
      //          if (selectedIds === "all") {
      //            setSelectedIds([]);
      //          } else {
      //            setSelectedIds("all");
      //          }
      //        }}
      //      />
      //    </div>
      //  ),
      //  Cell: (cellProps: CellProps<ProductProps>) => {
      //    return (
      //      <div className="form-check form-switch d-flex justify-content-center">
      //        <Input
      //          className="form-check-input"
      //          type="checkbox"
      //          role="switch"
      //          id="SwitchCheck1"
      //          checked={
      //            selectedIds === "all" ||
      //            selectedIds.includes(cellProps.row.original.id)
      //          }
      //          onChange={() => {
      //            toggleSelectedId(cellProps.row.original.id);
      //          }}
      //        />
      //      </div>
      //    );
      //  },
      //  id: "#",
      //  width: "8%",
      //},
      {
        Header: "Foto do produto",
        Cell: (cellProps: CellProps<ProductProps>) => {
          return (
            <div className="form-check form-switch">
              <Image
                src={cellProps.row.original?.product?.product_image?.src}
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
          return cellProps.row.original.product?.title;
        },
        id: "#name",
      },
      {
        Header: "Preço Original",
        Cell: (cellProps: CellProps<ProductProps>) => {
          const price = currentPrice({
            regular_price: cellProps.row.original?.product?.price?.regularPrice,
            price:
              cellProps.row.original.product?.price?.salePrice ??
              cellProps.row.original.product?.price?.regularPrice,
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
            regular_price: cellProps.row.original?.product?.price?.regularPrice,
            price:
              cellProps.row.original.product?.price?.salePrice ??
              cellProps.row.original.product?.price?.regularPrice,
          });

          return (
            discountPercentage(
              price.price,
              cellProps.row.original?.livePrice
            ).toString() + "%"
          );
        },
        id: "#discount",
        width: "10%",
      },
      {
        Header: "Preço da live",
        Cell: (cellProps: CellProps<ProductProps>) => {
          return formatNumberToReal(cellProps.row.original?.livePrice);
        },
        id: "#livePrice",
        width: "10%",
      },
      {
        Header: "Tempo visivel",
        Cell: (cellProps: CellProps<ProductProps>) => {
          const valueMetaData = cellProps.row.original?.metaData?.key === 'delayTime' ? (cellProps.row.original?.metaData?.valueInteger ?? 0) : 0

          return (
            <div>
              <div className="input-step">
                <button
                  type="button"
                  className="minus"
                  disabled={valueMetaData <= 5}
                  onClick={() => {
                    handleChangeDelay('remove', cellProps.row.original.steam_product_id, valueMetaData);
                  }}
                >
                  –
                </button>
                <Input
                  type="number"
                  className="product-quantity"
                  value={valueMetaData}
                  min="0"
                  max="100"
                  readOnly
                />
                <button
                  type="button"
                  className="plus"
                  onClick={() => {
                    handleChangeDelay('add', cellProps.row.original.steam_product_id, valueMetaData);
                  }}
                >
                  +
                </button>
              </div>
            </div>
          )
        },
        id: "#time",
        width: "10%",
      },
      {
        Header: "Ações",
        Cell: (cellProps: CellProps<ProductProps>) => {
          const price = currentPrice({
            regular_price: cellProps.row.original?.product?.price?.regularPrice,
            price:
              cellProps.row.original.product?.price?.salePrice ??
              cellProps.row.original.product?.price?.regularPrice,
          });

          return (
            <div className="d-flex align-items-center gap-1">
              <button
                type="button"
                color="primary"
                className="d-flex align-items-center gap-2 border-0 bg-transparent "
                onClick={() => handleStartPreview(cellProps.row.original)}
              >
                <Tooltip message="Iniciar visualização do produto">
                  <span className="bx bx-play fs-5" />
                </Tooltip>
              </button>

              <ChangeDiscountModal
                regularPrice={price.price}
                price={cellProps.row.original.livePrice}
                onChange={(newValue) => {
                  handleUpdatedProductDiscount(
                    cellProps.row.original.id,
                    newValue
                  )
                }}
              >
                <button
                  type="button"
                  color="primary"
                  className="d-flex align-items-center gap-2 border-0 bg-transparent "
                >
                  <Tooltip message="Alterar desconto">
                    <span className="bx bx-dollar fs-5" />
                  </Tooltip>
                </button>
              </ChangeDiscountModal>
              <ConfirmationModal
                changeStatus={async () => await handleDeleteProductFromLive(cellProps.row.original.id)
                }
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
    [handleChangeDelay, handleDeleteProductFromLive, handleStartPreview, handleUpdatedProductDiscount]
  );

  return (
    <Card className="shadow-none">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <h4 className="card-title mb-0 fw-bold">Produtos</h4>

        <InsertProductModal onSelect={handleAddToLiveProducts} exclude={
          products.map(product => product.id)
        }>
          <Button
            color="primary"

            className="d-flex align-items-center gap-2"
            type="button"
          >
            <span className="bx bx-plus fs-5" />
            Inserir produto
          </Button>
        </InsertProductModal>
      </Card.Header>

      <Card.Body>
        <TableContainer
          columns={columns}
          data={products}
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
