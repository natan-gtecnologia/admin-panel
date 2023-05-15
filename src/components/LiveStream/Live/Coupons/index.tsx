import { Card } from "@/components/Common/Card";

import TableContainer from "@/components/Common/TableContainer";
import { useCallback, useMemo } from "react";
import type { CellProps } from "react-table";
// import type { CreateOrUpdateSchemaType } from "../schema";

import { formatNumberToReal } from "@growthventure/utils/lib/formatting/format";
// import { InsertProductModal } from "../InsertProductModal";
import type { ICoupon } from "@/@types/coupon";
import { ILiveStream } from "@/@types/livestream";
import { Tooltip } from "@/components/Common/Tooltip";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { api } from "@/services/apiClient";
import { queryClient } from "@/services/react-query";
import { Button } from "reactstrap";
import { SelectCouponModal } from "../../CreateOrUpdate/Coupons/SelectCouponModal";

interface SaleProductProps {
  coupons: ICoupon[]
  liveId: number;
}

export function LiveCoupons({ coupons, liveId }: SaleProductProps) {
  const handleInsertCoupon = useCallback(async (newCoupons: number[]) => {
    try {
      await api.put(`/live-streams/${liveId}`, {
        data: {
          coupons: newCoupons
        }
      });

      await queryClient.invalidateQueries(
        ["liveStream", 'room', liveId]
      )
    } catch (error) {

    }
  }, [liveId])

  const handleRemoveCoupon = useCallback(async (coupon_id: number) => {
    try {
      await api.put(`/live-streams/${liveId}`, {
        data: {
          coupons: coupons.filter(coupon => coupon.id !== coupon_id).map(coupon => coupon.id),
        }
      });

      queryClient.setQueryData<ILiveStream | undefined>(
        ["liveStream", 'room', liveId], (oldData) => {
          if (!oldData)
            return;

          return {
            ...oldData,
            coupons: coupons.filter(coupon => coupon.id !== coupon_id)
          };
        }
      )
    } catch (error) {

    }
  }, [coupons, liveId])

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
                changeStatus={async () => handleRemoveCoupon(cellProps.row.original.id)
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

        <SelectCouponModal coupons={coupons.map(coupon => coupon.id)} onSelect={handleInsertCoupon}>
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
