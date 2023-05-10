import { Card } from "@/components/Common/Card";
import { useFormContext } from "react-hook-form";
import { Button, Label } from "reactstrap";

import type { IProduct } from "@/@types/product";
import { Input } from "@/components/Common/Form/Input";
import TableContainer from "@/components/Common/TableContainer";
import { useCallback, useMemo, useState } from "react";
import type { CellProps } from "react-table";
import type { CreateOrUpdateSchemaType } from "../schema";

import { ICoupon } from "@/@types/coupon";
import { Tooltip } from "@/components/Common/Tooltip";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { formatNumberToReal } from "@growthventure/utils/lib/formatting/format";

type CuponProps = ICoupon & CreateOrUpdateSchemaType["coupons"][number];

export function Coupons() {
  const [selectedIds, setSelectedIds] = useState<number[] | "all">([]);
  const { register, formState, control, watch, setValue } =
    useFormContext<CreateOrUpdateSchemaType>();
  const coupons = useMemo(
    () => [
      {
        id: 1,
        description: "Cupom de desconto",
        code: "CUPOM10",
        discount: 10,
        discountType: "percentage",
      },
      {
        id: 2,
        description: "Cupom de desconto",
        code: "CUPOM10",
        discount: 10,
        discountType: "percentage",
      },
    ],
    []
  );

  const handleRemoveCoupon = useCallback((id: number) => {}, []);

  const toggleSelectedId = useCallback(
    (id: number) => {
      if (selectedIds === "all") {
        setSelectedIds(
          coupons
            .filter((coupon) => coupon.id !== id)
            .map((coupon) => coupon.id)
        );
      } else if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
      } else {
        const newSelectedIds = [...selectedIds, id];
        setSelectedIds(
          newSelectedIds.length === coupons.length ? "all" : newSelectedIds
        );
      }
    },
    [coupons, selectedIds]
  );

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
        Header: "Nome do cupom",
        Cell: (cellProps: CellProps<CuponProps>) => {
          return cellProps.row.original.description;
        },
        id: "#name",
      },
      {
        Header: "Código do Cupom",
        Cell: (cellProps: CellProps<CuponProps>) => {
          return cellProps.row.original.code;
        },
        id: "#code",
      },
      {
        Header: "Desconto",
        Cell: (cellProps: CellProps<CuponProps>) => {
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
        Cell: (cellProps: CellProps<CuponProps>) => {
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
    [handleRemoveCoupon, selectedIds, toggleSelectedId]
  );

  return (
    <Card className="shadow-none">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <h4 className="card-title mb-0 fw-bold">Cupons disponíveis</h4>

        <Button
          color="primary"
          className="d-flex align-items-center gap-2"
          type="button"
        >
          <span className="bx bx-plus fs-5" />
          Inserir cupom
        </Button>
      </Card.Header>

      <Card.Body>
        <TableContainer
          columns={columns}
          data={coupons}
          customPageSize={10}
          divClass="table-responsive mb-1"
          tableClass="mb-0 align-middle table-borderless"
          theadClass="table-light text-muted"
        />
      </Card.Body>
    </Card>
  );
}
