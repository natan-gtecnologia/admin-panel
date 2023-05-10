import { Card } from "@/components/Common/Card";
import { useFormContext } from "react-hook-form";
import { Button, Label } from "reactstrap";

import type { IProduct } from "@/@types/product";
import { Input } from "@/components/Common/Form/Input";
import TableContainer from "@/components/Common/TableContainer";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import type { CellProps } from "react-table";
import type { CreateOrUpdateSchemaType } from "../schema";

import { Tooltip } from "@/components/Common/Tooltip";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { currentPrice, discountPercentage } from "@/utils/price";
import { formatNumberToReal } from "@growthventure/utils/lib/formatting/format";
import { InsertProductModal } from "../InsertProductModal";
import { ChangeDiscountModal } from "./ChangeDiscountModal";

type ProductProps = IProduct & CreateOrUpdateSchemaType["products"][number];

export function Products() {
  const [selectedIds, setSelectedIds] = useState<number[] | "all">([]);
  const { register, formState, control, watch, setValue, getValues } =
    useFormContext<CreateOrUpdateSchemaType>();
  const products = useMemo(
    () => [
      {
        id: 1,
        title: "Produto 1",
        price: {
          regularPrice: 100,
          salePrice: 80,
        },
        livePrice: 70,
        images: {
          data: [
            {
              attributes: {
                formats: {
                  thumbnail: {
                    url: "https://via.placeholder.com/150",
                  },
                },
              },
            },
          ],
        },
      },
    ],
    []
  );

  const toggleSelectedId = useCallback(
    (id: number) => {
      if (selectedIds === "all") {
        setSelectedIds(
          products
            .filter((coupon) => coupon.id !== id)
            .map((coupon) => coupon.id)
        );
      } else if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
      } else {
        const newSelectedIds = [...selectedIds, id];
        setSelectedIds(
          newSelectedIds.length === products.length ? "all" : newSelectedIds
        );
      }
    },
    [products, selectedIds]
  );

  const handleRemoveProduct = useCallback((id: number) => {}, []);

  const columns = useMemo(
    () => [
      {
        Header: (
          <div className="form-check form-switch d-flex justify-content-center flex-1 align-items-center">
            <Label className="form-check-label me-1" for="SwitchCheck1">
              Ativar todos
            </Label>

            <Input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="SwitchCheck1"
              checked={selectedIds === "all"}
              onChange={() => {
                if (selectedIds === "all") {
                  setSelectedIds([]);
                } else {
                  setSelectedIds("all");
                }
              }}
            />
          </div>
        ),
        Cell: (cellProps: CellProps<IProduct>) => {
          return (
            <div className="form-check form-switch d-flex justify-content-center">
              <Input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="SwitchCheck1"
                checked={
                  selectedIds === "all" ||
                  selectedIds.includes(cellProps.row.original.id)
                }
                onChange={() => {
                  toggleSelectedId(cellProps.row.original.id);
                }}
              />
            </div>
          );
        },
        id: "#",
        width: "8%",
      },
      {
        Header: "Foto do produto",
        Cell: (cellProps: CellProps<IProduct>) => {
          return (
            <div className="form-check form-switch">
              {cellProps.row.original.images.data &&
                cellProps.row.original.images.data.length > 0 && (
                  <Image
                    src={
                      cellProps.row.original.images.data[0].attributes.formats
                        .thumbnail.url
                    }
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
                )}
            </div>
          );
        },
        id: "#picture",
        width: "10%",
      },
      {
        Header: "Nome do Produto",
        Cell: (cellProps: CellProps<ProductProps>) => {
          return cellProps.row.original.title;
        },
        id: "#name",
      },
      {
        Header: "Preço Original",
        Cell: (cellProps: CellProps<ProductProps>) => {
          const price = currentPrice({
            regular_price: cellProps.row.original.price.regularPrice,
            price:
              cellProps.row.original.price?.salePrice ??
              cellProps.row.original.price.regularPrice,
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
            regular_price: cellProps.row.original.price.regularPrice,
            price:
              cellProps.row.original.price?.salePrice ??
              cellProps.row.original.price.regularPrice,
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
          const price = currentPrice({
            regular_price: cellProps.row.original.price.regularPrice,
            price:
              cellProps.row.original.price?.salePrice ??
              cellProps.row.original.price.regularPrice,
          });

          return (
            <div className="d-flex align-items-center gap-1">
              <ChangeDiscountModal
                regularPrice={price.price}
                price={cellProps.row.original.livePrice}
                onChange={(newValue) => {
                  const products = getValues("products");

                  const newProducts = products.map((product) => {
                    if (product.id === cellProps.row.original.id) {
                      return {
                        ...product,
                        livePrice: newValue,
                      };
                    }

                    return product;
                  });

                  setValue("products", newProducts);
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
                changeStatus={() =>
                  handleRemoveProduct(cellProps.row.original.id)
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
    [getValues, handleRemoveProduct, selectedIds, setValue, toggleSelectedId]
  );

  return (
    <Card className="shadow-none">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <h4 className="card-title mb-0 fw-bold">Produtos</h4>

        <InsertProductModal>
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
        />
      </Card.Body>
    </Card>
  );
}
