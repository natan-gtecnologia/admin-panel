import { Card } from "@/components/Common/Card";

import type { IProduct } from "@/@types/product";
import TableContainer from "@/components/Common/TableContainer";
import { useMemo } from "react";
import type { CellProps } from "react-table";
// import type { CreateOrUpdateSchemaType } from "../schema";

import { formatNumberToReal } from "@growthventure/utils/lib/formatting/format";
// import { InsertProductModal } from "../InsertProductModal";
import { ICoupon } from "@growthventure/utils";
import { CreateOrUpdateSchemaType } from "../../CreateOrUpdate/schema";

type ProductProps = IProduct & CreateOrUpdateSchemaType["products"][number];

interface SaleProductProps {
  coupons: any
}

export function LiveCoupons({ coupons }: SaleProductProps) {

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
