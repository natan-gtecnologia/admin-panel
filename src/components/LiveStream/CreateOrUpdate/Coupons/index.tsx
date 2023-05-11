import { Card } from "@/components/Common/Card";
import { useFormContext } from "react-hook-form";
import { Button } from "reactstrap";

import TableContainer from "@/components/Common/TableContainer";
import { useCallback, useMemo, useState } from "react";
import type { CellProps } from "react-table";
import type { CreateOrUpdateSchemaType } from "../schema";

import type { ICoupon } from "@/@types/coupon";
import { Tooltip } from "@/components/Common/Tooltip";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { api } from "@/services/apiClient";
import { convert_coupon_strapi } from "@/utils/convertions/convert_coupon";
import { formatNumberToReal } from "@growthventure/utils/lib/formatting/format";
import { useQuery } from "@tanstack/react-query";
import { SelectCouponModal } from "./SelectCouponModal";

type CuponProps = ICoupon;

export function Coupons() {
  const [selectedIds, setSelectedIds] = useState<number[] | "all">([]);
  const { register, formState, control, watch, setValue } =
    useFormContext<CreateOrUpdateSchemaType>();
  const coupons = watch("coupons");
  const { data: couponsFromApi } = useQuery({
    queryKey: ["coupons", "in", coupons],
    queryFn: async () => {
      try {
        if (!coupons.length) return [] as ICoupon[];

        const response = await api.get("/coupons", {
          params: {
            filters: {
              id: {
                $in: coupons,
              },
            },
            pagination: {
              pageSize: 100,
            },
          },
        });

        return (response.data?.data?.map(convert_coupon_strapi) ??
          []) as ICoupon[];
      } catch (error) {
        return [] as ICoupon[];
      }
    },
    initialData: [] as ICoupon[],
    refetchOnWindowFocus: false,
  });

  const handleRemoveCoupon = useCallback(
    (id: number) => {
      setValue(
        "coupons",
        coupons.filter((coupon) => coupon !== id)
      );
    },
    [coupons, setValue]
  );

  //const toggleSelectedId = useCallback(
  //  (id: number) => {
  //    //if (selectedIds === "all") {
  //    //  setSelectedIds(
  //    //    coupons
  //    //      .filter((coupon) => coupon.id !== id)
  //    //      .map((coupon) => coupon.id)
  //    //  );
  //    //} else if (selectedIds.includes(id)) {
  //    //  setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
  //    //} else {
  //    //  const newSelectedIds = [...selectedIds, id];
  //    //  setSelectedIds(
  //    //    newSelectedIds.length === coupons.length ? "all" : newSelectedIds
  //    //  );
  //    //}
  //  },
  //  [coupons, selectedIds]
  //);

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
            <div className="d-flex align-items-center gap-1">
              <ConfirmationModal
                changeStatus={() =>
                  handleRemoveCoupon(cellProps.row.original.id)
                }
                title="Remover cupom"
                message="Deseja realmente remover esta cupom? Essa ação não poderá ser desfeita."
              >
                <button
                  type="button"
                  className="d-flex align-items-center gap-2 border-0 bg-transparent text-danger"
                >
                  <Tooltip message="Remover cupom">
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
    [handleRemoveCoupon]
  );

  return (
    <Card className="shadow-none">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <h4 className="card-title mb-0 fw-bold">Cupons disponíveis</h4>

        <SelectCouponModal>
          <Button
            color="primary"
            className="d-flex align-items-center gap-2"
            type="button"
          >
            <span className="bx bx-plus fs-5" />
            Inserir cupom
          </Button>
        </SelectCouponModal>
      </Card.Header>

      <Card.Body>
        <TableContainer
          columns={columns}
          data={couponsFromApi}
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
