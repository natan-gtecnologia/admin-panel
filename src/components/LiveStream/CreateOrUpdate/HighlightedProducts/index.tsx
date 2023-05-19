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
import { api } from "@/services/apiClient";
import { currentPrice, discountPercentage } from "@/utils/price";
import { convert_product_strapi } from "@growthventure/utils/lib/formatting/convertions/convert_product";
import { formatNumberToReal } from "@growthventure/utils/lib/formatting/format";
import { useQuery } from "@tanstack/react-query";
import QueryString from "qs";
import { InsertProductModal } from "../InsertProductModal";

type ProductProps = IProduct & CreateOrUpdateSchemaType["products"][number];

export function HighlightedProducts() {
  const { watch, setValue, getValues } = useFormContext<CreateOrUpdateSchemaType>();
  const productsFromForm = watch("products");
  const { data: products } = useQuery({
    queryKey: ["products", productsFromForm],
    queryFn: async () => {
      try {
        const response = await api.get("/products", {
          params: {
            filters: {
              id: {
                $in: productsFromForm?.map((product) => product.id),
              },
            },
            pagination: {
              pageSize: 100,
            },
          },
          paramsSerializer: {
            serialize: (params) => QueryString.stringify(params),
          },
        });

        const formattedProducts: IProduct[] = response.data.data?.map(
          convert_product_strapi
        );

        return formattedProducts.map((product) => {
          return {
            ...product,
            livePrice: productsFromForm.find(
              (productFromForm) => productFromForm.id === product.id
            )?.livePrice,
            highlighted: productsFromForm.find(
              (productFromForm) => productFromForm.id === product.id
            )?.highlighted,
          };
        });
      } catch (error) {
        console.log(error);
        return [] as ProductProps[];
      }
    },
    enabled: productsFromForm?.length > 0,
    initialData: [],
    refetchOnWindowFocus: false,
  });

  const onlyHighlightedProducts = useMemo(
    () => products?.filter((product) => product.highlighted),
    [products]
  );

  const handleRemoveProduct = useCallback(
    (id: number) => {
      setValue(
        "products",
        productsFromForm.map((product) => ({
          ...product,
          highlighted: product.id !== id ? product.highlighted : false,
        }))
      );
    },
    [productsFromForm, setValue]
  );

  const columns = useMemo(
    () => [
      {
        Header: "Foto do produto",
        Cell: (cellProps: CellProps<ProductProps>) => {
          return (
            <div className="form-check form-switch">
              <Image
                src={cellProps.row.original.product_image.src}
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

  const handleInsertNewProducts = useCallback((ids: number[]) => {
    const list = getValues("products");

    setValue(
      "products",
      list.map((product) => {
        return {
          ...product,
          highlighted: ids.includes(product.id),
        };
      })
    );
  }, [getValues, setValue])

  return (
    <Card className="shadow-none">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <h4 className="card-title mb-0 fw-bold">
          Produtos em destaque (Máx. 4)
        </h4>

        <InsertProductModal onSelect={handleInsertNewProducts} products={products}>
          <Button
            color="primary"
            className="d-flex align-items-center gap-2"
            disabled={onlyHighlightedProducts.length === 4}
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
          data={onlyHighlightedProducts}
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
