import { Card } from "@/components/Common/Card";
import { useFormContext } from "react-hook-form";
import { Button } from "reactstrap";

import TableContainer from "@/components/Common/TableContainer";
import { useMemo, useState } from "react";
import type { CellProps } from "react-table";
import type { CreateOrUpdateSchemaType } from "../schema";

import { Tooltip } from "@/components/Common/Tooltip";

type BroadcasterProps = {
  id: number;
  name: string;
  email: string;
};

export function Broadcasters() {
  const [selectedIds, setSelectedIds] = useState<number[] | "all">([]);
  const { register, formState, control, watch, setValue } =
    useFormContext<CreateOrUpdateSchemaType>();

  const columns = useMemo(
    () => [
      {
        Header: "Nome da apresentadora",
        Cell: (cellProps: CellProps<BroadcasterProps>) => {
          return cellProps.row.original.name;
        },
        id: "#name",
      },
      {
        Header: "E-mail da apresentadora",
        Cell: (cellProps: CellProps<BroadcasterProps>) => {
          return cellProps.row.original.email;
        },
        id: "#email",
      },
      {
        Header: "Ações",
        Cell: (cellProps: CellProps<BroadcasterProps>) => {
          return (
            <div className="d-flex align-items-center gap-1">
              <Tooltip message="Alterar desconto">
                <button
                  type="button"
                  color="primary"
                  className="d-flex align-items-center gap-2 border-0 bg-transparent "
                >
                  <span className="bx bxs-pencil fs-5" />
                </button>
              </Tooltip>
              <Tooltip message="Enviar e-mail">
                <button
                  type="button"
                  color="primary"
                  className="d-flex align-items-center gap-2 border-0 bg-transparent "
                >
                  <span className="bx bxs-envelope fs-5" />
                </button>
              </Tooltip>
              <Tooltip message="Remover cupom">
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
    []
  );

  return (
    <Card className="shadow-none">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <h4 className="card-title mb-0 fw-bold">Lista de apresentadoras</h4>

        <Button color="primary" className="d-flex align-items-center gap-2">
          <span className="bx bx-plus fs-5" />
          Inserir apresentadora
        </Button>
      </Card.Header>

      <Card.Body>
        <TableContainer
          columns={columns}
          data={[
            {
              id: 1,
              name: "Maria",
              email: "maria@gmail.com",
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
