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
import { ChangeDiscountModal } from "./ChangeDiscountModal";

type ProductProps = IProduct & CreateOrUpdateSchemaType["products"][number];

export function Products() {
  //const [selectedIds, setSelectedIds] = useState<number[] | "all">([]);
  const { watch, setValue, getValues } =
    useFormContext<CreateOrUpdateSchemaType>();
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

  //const toggleSelectedId = useCallback(
  //  (id: number) => {
  //    if (selectedIds === "all") {
  //      setSelectedIds(
  //        products
  //          .filter((product: any) => product.id !== id)
  //          .map((product: any) => product.id)
  //      );
  //    } else if (selectedIds.includes(id)) {
  //      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
  //    } else {
  //      const newSelectedIds = [...selectedIds, id];
  //      setSelectedIds(
  //        newSelectedIds.length === products.length ? "all" : newSelectedIds
  //      );
  //    }
  //  },
  //  [products, selectedIds]
  //);

  const handleRemoveProduct = useCallback(
    (id: number) => {
      setValue(
        "products",
        productsFromForm.filter((product) => product.id !== id)
      );
    },
    [productsFromForm, setValue]
  );

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
    [getValues, handleRemoveProduct, setValue]
  );

  const handleInsertNewProducts = useCallback((ids: number[], products?: IProduct[]) => {
    if (!products) return;
    const list = getValues("products");

    const newProducts = products
      .filter((product) => {
        return ids.includes(product.id);
      })
      .map((product) => ({
        id: product.id,
        livePrice: product.price?.salePrice ?? product.price?.regularPrice,
        highlighted: false,
      }));

    setValue("products", [...list, ...newProducts]);
  }, [])

  return (
    <Card className="shadow-none">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <h4 className="card-title mb-0 fw-bold">Produtos</h4>

        <InsertProductModal onSelect={handleInsertNewProducts}>
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
