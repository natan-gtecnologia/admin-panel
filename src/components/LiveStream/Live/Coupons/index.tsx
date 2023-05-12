import { Card } from "@/components/Common/Card";
import { useFormContext } from "react-hook-form";
import { Button } from "reactstrap";

import type { IProduct } from "@/@types/product";
import TableContainer from "@/components/Common/TableContainer";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import type { CellProps } from "react-table";
// import type { CreateOrUpdateSchemaType } from "../schema";

import { Tooltip } from "@/components/Common/Tooltip";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { api } from "@/services/apiClient";
import { currentPrice, discountPercentage } from "@/utils/price";
import { convert_product_strapi } from "@growthventure/utils/lib/formatting/convertions/convert_product";
import { formatNumberToReal } from "@growthventure/utils/lib/formatting/format";
import { useQuery } from "@tanstack/react-query";
import QueryString from "qs";
// import { InsertProductModal } from "../InsertProductModal";
import { ChangeDiscountModal } from "./ChangeDiscountModal";
import { CreateOrUpdateSchemaType } from "../../CreateOrUpdate/schema";
import { ICoupon } from "@growthventure/utils";

type ProductProps = IProduct & CreateOrUpdateSchemaType["products"][number];

interface SaleProductProps {
  coupons: any
}

export function LiveCoupons({ coupons }: SaleProductProps) {
  // console.log("products", products)
  // const [selectedIds, setSelectedIds] = useState<number[] | "all">([]);
  // const { watch, setValue, getValues } =
  //   useFormContext<CreateOrUpdateSchemaType>();
  // const productsFromForm = watch("products");

  // const { data: products } = useQuery({
  //   queryKey: ["products", productsFromForm],
  //   queryFn: async () => {
  //     try {
  //       const response = await api.get("/products", {
  //         params: {
  //           filters: {
  //             id: {
  //               $in: productsFromForm?.map((product) => product.id),
  //             },
  //           },
  //           pagination: {
  //             pageSize: 100,
  //           },
  //         },
  //         paramsSerializer: {
  //           serialize: (params) => QueryString.stringify(params),
  //         },
  //       });

  //       const formattedProducts: IProduct[] = response.data.data?.map(
  //         convert_product_strapi
  //       );

  //       return formattedProducts.map((product) => {
  //         return {
  //           ...product,
  //           livePrice: productsFromForm.find(
  //             (productFromForm) => productFromForm.id === product.id
  //           )?.livePrice,
  //           highlighted: productsFromForm.find(
  //             (productFromForm) => productFromForm.id === product.id
  //           )?.highlighted,
  //         };
  //       });
  //     } catch (error) {
  //       console.log(error);
  //       return [] as ProductProps[];
  //     }
  //   },
  //   enabled: productsFromForm?.length > 0,
  //   initialData: [],
  //   refetchOnWindowFocus: false,
  // });

  // const toggleSelectedId = useCallback(
  //   (id: number) => {
  //     if (selectedIds === "all") {
  //       setSelectedIds(
  //         products
  //           .filter((product: any) => product.id !== id)
  //           .map((product: any) => product.id)
  //       );
  //     } else if (selectedIds.includes(id)) {
  //       setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
  //     } else {
  //       const newSelectedIds = [...selectedIds, id];
  //       setSelectedIds(
  //         newSelectedIds.length === products.length ? "all" : newSelectedIds
  //       );
  //     }
  //   },
  //   [products, selectedIds]
  // );

  // const handleRemoveProduct = useCallback(
  //   (id: number) => {
  //     setValue(
  //       "products",
  //       productsFromForm.filter((product) => product.id !== id)
  //     );
  //   },
  //   [productsFromForm, setValue]
  // );

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
      //  Cell: (cellProps: CellProps<ICoupon>) => {
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
        Header: "Nome do cupom",
        Cell: (cellProps: CellProps<ICoupon>) => {
          return cellProps.row.original.description;
        },
        id: "#name",
      },
      {
        Header: "Código do Cupom",
        Cell: (cellProps: CellProps<ICoupon>) => {
          return cellProps.row.original.code;
        },
        id: "#code",
      },
      {
        Header: "Desconto",
        Cell: (cellProps: CellProps<ICoupon>) => {
          return cellProps.row.original.discountType === "percentage" ? (
            <span>{cellProps.row.original.discount}%</span>
          ) : (
            <span>{formatNumberToReal(cellProps.row.original.discount)}</span>
          );
        },
        id: "#discount",
      },
      {
        Header: "Ações",
        Cell: (cellProps: CellProps<ICoupon>) => {
          return (
            <></>
            // <div className="d-flex align-items-center gap-1">
            //   <ConfirmationModal
            //     changeStatus={() =>
            //       handleRemoveCoupon(cellProps.row.original.id)
            //     }
            //     title="Remover cupom"
            //     message="Deseja realmente remover esta cupom? Essa ação não poderá ser desfeita."
            //   >
            //     <button
            //       type="button"
            //       className="d-flex align-items-center gap-2 border-0 bg-transparent text-danger"
            //     >
            //       <Tooltip message="Remover cupom">
            //         <span className="bx bxs-x-circle fs-5" />
            //       </Tooltip>
            //     </button>
            //   </ConfirmationModal>
            // </div>
          );
        },
        id: "#actions",
        width: "8%",
      },
    ],
    []
  );

  return (
    <Card className="shadow-none">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <h4 className="card-title mb-0 fw-bold">Cupons disponíveis</h4>

        {/* <InsertProductModal>
          <Button
            color="primary"
            className="d-flex align-items-center gap-2"
            type="button"
          >
            <span className="bx bx-plus fs-5" />
            Inserir produto
          </Button>
        </InsertProductModal> */}
      </Card.Header>

      <Card.Body>
        <TableContainer
          columns={columns}
          data={coupons}
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
