import { Card } from "@/components/Common/Card";
import { useFormContext } from "react-hook-form";
import { Button } from "reactstrap";

import TableContainer from "@/components/Common/TableContainer";
import { useCallback, useMemo } from "react";
import type { CellProps } from "react-table";
import type { CreateOrUpdateSchemaType } from "../schema";

import { ILiveStream } from "@/@types/livestream";
import { Tooltip } from "@/components/Common/Tooltip";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { api } from "@/services/apiClient";
import { useQuery } from "@tanstack/react-query";
import QueryString from "qs";
import { CreateOrUpdateBroadcaster } from "./CreateOrUpdateBroadcaster";

type BroadcasterProps = {
  id: number;
  name: string;
  email: string;
  code: string;
};

type Props = {
  liveStream?: ILiveStream | null | undefined;
};

export function Broadcasters({ liveStream }: Props) {
  const { watch, setValue } = useFormContext<CreateOrUpdateSchemaType>();
  const broadcasters = watch("broadcasters");
  const { data: broadcastersData, refetch } = useQuery({
    queryKey: ["broadcasters", broadcasters],
    queryFn: async () => {
      if (!broadcasters?.length) return [] as BroadcasterProps[];

      try {
        const response = await api.get("/broadcasters", {
          params: {
            filters: {
              id: {
                $in: broadcasters,
              },
            },
          },
          paramsSerializer: {
            serialize: (params) => QueryString.stringify(params),
          },
        });

        const formattedData =
          response.data?.data?.map(
            (broadcaster: {
              id: number;
              attributes: {
                name: string;
                email: string;
              };
            }) => {
              const broadcasterData =
                liveStream?.broadcasters.find(
                  (broadcasterData) => broadcasterData.id === broadcaster.id
                )?.code ?? "";

              return {
                id: broadcaster.id,
                name: broadcaster.attributes.name,
                email: broadcaster.attributes.email,
                code: broadcasterData,
              };
            }
          ) ?? [];

        return formattedData as BroadcasterProps[];
      } catch (error) {
        return [] as BroadcasterProps[];
      }
    },
    initialData: [] as BroadcasterProps[],
  });

  const handleRemovedBroadcaster = useCallback(
    (id: number) => {
      setValue(
        "broadcasters",
        broadcasters.filter((broadcaster) => broadcaster !== id)
      );
    },
    [broadcasters, setValue]
  );

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
        Header: "Código",
        Cell: (cellProps: CellProps<BroadcasterProps>) => {
          return cellProps.row.original.code;
        },
        id: "#code",
      },
      {
        Header: "Ações",
        Cell: (cellProps: CellProps<BroadcasterProps>) => {
          return (
            <div className="d-flex align-items-center gap-1">
              <CreateOrUpdateBroadcaster
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
              </CreateOrUpdateBroadcaster>

              <Tooltip message="Enviar e-mail">
                <button
                  type="button"
                  color="primary"
                  className="d-flex align-items-center gap-2 border-0 bg-transparent "
                >
                  <span className="bx bxs-envelope fs-5" />
                </button>
              </Tooltip>

              <ConfirmationModal
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
              </ConfirmationModal>
            </div>
          );
        },
        id: "#actions",
        width: "8%",
      },
    ],
    [handleRemovedBroadcaster, refetch]
  );

  return (
    <Card className="shadow-none">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <h4 className="card-title mb-0 fw-bold">Lista de apresentadores</h4>

        <CreateOrUpdateBroadcaster>
          <Button
            color="primary"
            className="d-flex align-items-center gap-2"
            type="button"
          >
            <span className="bx bx-plus fs-5" />
            Inserir apresentador(a)
          </Button>
        </CreateOrUpdateBroadcaster>
      </Card.Header>

      <Card.Body>
        <TableContainer
          columns={columns}
          data={broadcastersData}
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
