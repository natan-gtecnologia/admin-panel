import { Card } from "@/components/Common/Card";

import type { IProduct } from "@/@types/product";
import TableContainer from "@/components/Common/TableContainer";
import { useMemo } from "react";
import type { CellProps } from "react-table";
// import type { CreateOrUpdateSchemaType } from "../schema";

import { Tooltip } from "@/components/Common/Tooltip";
// import { InsertProductModal } from "../InsertProductModal";
import { CreateOrUpdateSchemaType } from "../../CreateOrUpdate/schema";

type ProductProps = IProduct & CreateOrUpdateSchemaType["products"][number];

interface SaleProductProps {
  broadcasters: any
}

export function LiveBroadcasters({ broadcasters }: SaleProductProps) {

  const columns = useMemo(
    () => [
      {
        Header: "Nome da apresentadora",
        Cell: (cellProps: CellProps<any>) => {
          return cellProps.row.original.name;
        },
        id: "#name",
      },
      {
        Header: "E-mail da apresentadora",
        Cell: (cellProps: CellProps<any>) => {
          return cellProps.row.original.email;
        },
        id: "#email",
      },
      {
        Header: "Código",
        Cell: (cellProps: CellProps<any>) => {
          return cellProps.row.original.code;
        },
        id: "#code",
      },
      {
        Header: "Ações",
        Cell: (cellProps: CellProps<any>) => {
          return (
            <div className="d-flex align-items-center gap-1">
              {/* <CreateOrUpdateBroadcaster
                broadcaster={cellProps.row.original}
                onSuccess={async () => {
                  await refetch();
                }}
              >
                <button
                  type="button"
                  color="primary"
                  className="d-flex align-items-center gap-2 border-0 bg-transparent "
                >
                  <Tooltip message="Alterar dados">
                    <span className="bx bxs-pencil fs-5" />
                  </Tooltip>
                </button>
              </CreateOrUpdateBroadcaster> */}

              <Tooltip message="Enviar e-mail">
                <button
                  type="button"
                  color="primary"
                  className="d-flex align-items-center gap-2 border-0 bg-transparent "
                >
                  <span className="bx bxs-envelope fs-5" />
                </button>
              </Tooltip>

              {/* <ConfirmationModal
                changeStatus={() =>
                  handleRemovedBroadcaster(cellProps.row.original.id)
                }
                title="Remover apresentadora"
                message="Deseja realmente remover esta apresentadora? Essa ação não poderá ser desfeita."
              >
                <button
                  type="button"
                  className="d-flex align-items-center gap-2 border-0 bg-transparent text-danger"
                >
                  <Tooltip message="Remover apresentador(a)">
                    <span className="bx bxs-x-circle fs-5" />
                  </Tooltip>
                </button>
              </ConfirmationModal> */}
            </div>
          );
        },
        id: "#actions",
        width: "8%",
      },
    ],
    [broadcasters]
  );

  return (
    <Card className="shadow-none">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <h4 className="card-title mb-0 fw-bold">Lista de apresentadores</h4>

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
          data={broadcasters}
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
