import { Card } from "@/components/Common/Card";
import { useFormContext } from "react-hook-form";
import { Button, Label } from "reactstrap";

import type { IProduct } from "@/@types/product";
import { Input } from "@/components/Common/Form/Input";
import TableContainer from "@/components/Common/TableContainer";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { CellProps } from "react-table";
import type { CreateOrUpdateSchemaType } from "../schema";

import { Tooltip } from "@/components/Common/Tooltip";
import { currentPrice, discountPercentage } from "@/utils/price";
import { formatNumberToReal } from "@growthventure/utils/lib/formatting/format";

type ProductProps = IProduct & CreateOrUpdateSchemaType["products"][number];

export function Products() {
  const [selectedIds, setSelectedIds] = useState<number[] | "all">([]);
  const { register, formState, control, watch, setValue } =
    useFormContext<CreateOrUpdateSchemaType>();

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
      },
      {
        Header: "Preço da live",
        Cell: (cellProps: CellProps<ProductProps>) => {
          return formatNumberToReal(cellProps.row.original.livePrice);
        },
        id: "#livePrice",
      },
      {
        Header: "Ações",
        Cell: (cellProps: CellProps<ProductProps>) => {
          return (
            <div className="d-flex align-items-center gap-1">
              <Tooltip message="Alterar desconto">
                <button
                  type="button"
                  color="primary"
                  className="d-flex align-items-center gap-2 border-0 bg-transparent "
                >
                  <span className="bx bx-dollar fs-5" />
                </button>
              </Tooltip>
              <Tooltip message="Remover produto">
                <button
                  type="button"
                  className="d-flex align-items-center gap-2 border-0 bg-transparent text-danger"
                >
                  <span className="bx bxs-x-circle fs-5" />
                </button>
              </Tooltip>
            </div>
          );
        },
        id: "#actions",
        width: "8%",
      },
    ],
    [selectedIds]
  );

  return (
    <Card className="shadow-none">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <h4 className="card-title mb-0 fw-bold">Produtos</h4>

        <Button color="primary" className="d-flex align-items-center gap-2">
          <span className="bx bx-plus fs-5" />
          Inserir produto
        </Button>
      </Card.Header>

      <Card.Body>
        <TableContainer
          columns={columns}
          data={[
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
          ]}
          customPageSize={10}
          divClass="table-responsive mb-1"
          tableClass="mb-0 align-middle table-borderless"
          theadClass="table-light text-muted"
        />
      </Card.Body>
    </Card>
  );
}
