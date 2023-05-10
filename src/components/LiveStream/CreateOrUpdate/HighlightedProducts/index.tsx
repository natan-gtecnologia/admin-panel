import { Card } from "@/components/Common/Card";
import { useFormContext } from "react-hook-form";
import { Button } from "reactstrap";

import type { IProduct } from "@/@types/product";
import TableContainer from "@/components/Common/TableContainer";
import Image from "next/image";
import { useCallback, useMemo } from "react";
import type { CellProps } from "react-table";
import type { CreateOrUpdateSchemaType } from "../schema";

import { Tooltip } from "@/components/Common/Tooltip";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { currentPrice, discountPercentage } from "@/utils/price";
import { formatNumberToReal } from "@growthventure/utils/lib/formatting/format";

type ProductProps = IProduct & CreateOrUpdateSchemaType["products"][number];

export function HighlightedProducts() {
  const { register, formState, control, watch, setValue } =
    useFormContext<CreateOrUpdateSchemaType>();

  const highlightedProducts = useMemo(
    () => [
      {
        id: 1,
        title: "Produto 1",
        price: {
          regularPrice: 100,
          salePrice: 80,
        },
        livePrice: 80,
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

  const handleRemoveProduct = useCallback((id: number) => {}, []);

  const columns = useMemo(
    () => [
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
          return (
            <div className="d-flex align-items-center gap-1">
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
    [handleRemoveProduct]
  );

  return (
    <Card className="shadow-none">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <h4 className="card-title mb-0 fw-bold">
          Produtos em destaque (Máx. 4)
        </h4>

        <Button
          color="primary"
          className="d-flex align-items-center gap-2"
          disabled={highlightedProducts.length === 4}
          type="button"
        >
          <span className="bx bx-plus fs-5" />
          Inserir produto destaque
        </Button>
      </Card.Header>

      <Card.Body>
        <TableContainer
          columns={columns}
          data={highlightedProducts}
          customPageSize={10}
          divClass="table-responsive mb-1"
          tableClass="mb-0 align-middle table-borderless"
          theadClass="table-light text-muted"
        />
      </Card.Body>
    </Card>
  );
}
