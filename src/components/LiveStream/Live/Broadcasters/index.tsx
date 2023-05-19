import { Card } from "@/components/Common/Card";

import TableContainer from "@/components/Common/TableContainer";
import { useCallback, useMemo } from "react";
import type { CellProps } from "react-table";

import { ILiveStream } from "@/@types/livestream";
import { Tooltip } from "@/components/Common/Tooltip";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { api } from "@/services/apiClient";
import { queryClient } from "@/services/react-query";
import { Button } from "reactstrap";
import { CreateOrUpdateSchemaType } from "../../CreateOrUpdate/schema";
import { SelectBroadcasterModal } from "./SelectBroadcasterModal";

type BroadcasterProps = {
  id: number;
  name: string;
  email: string;
  code: string;
  avatar_id: number | null;
};

type Props = {
  broadcasters: {
    code: string;
    broadcaster_id: number;
    id: number | null;
    name: string | null;
    email: string | null;
    avatar: {
      id: number;
      src: string;
      thumbnail: {
        src: string;
      };
    } | null;
    socialMedias: {
      id: 1;
      facebook: string | null;
      twitter: string | null;
      instagram: string | null;
      whatsapp: string | null;
      telegram: string | null;
    } | null;
  }[],
  liveId: number;
};

function getFormattedBroadcasters(
  broadcasters: CreateOrUpdateSchemaType["broadcasters"],
  broadcastersData: NonNullable<Props["broadcasters"]>
) {
  return broadcasters.map((broadcaster) => {
    const broadcasterData = broadcastersData.find(
      (broadcasterData) => broadcasterData.broadcaster_id === broadcaster
    );

    return {
      broadcaster: broadcaster,
      ...(broadcasterData?.id && { id: broadcasterData?.id }),
    };
  });
}

export function LiveBroadcasters({ broadcasters, liveId }: Props) {

  const handleInsertBroadcasters = useCallback(async (newBroadcasters: number[]) => {
    const formattedBroadcasters = getFormattedBroadcasters(
      newBroadcasters,
      broadcasters
    );

    try {
      await api.put(`/live-streams/${liveId}`, {
        data: {
          broadcasters:
            formattedBroadcasters.length > 0 ? formattedBroadcasters : newBroadcasters.map((broadcaster) => ({ broadcaster })),
        }
      });

      await queryClient.invalidateQueries(
        ["liveStream", 'room', liveId]
      )
    } catch (error) {
      console.log(error)
    }
  }, [broadcasters, liveId])

  const handleRemoveBroadcaster = useCallback(async (broadcaster_id: number) => {
    try {

      await api.put(`/live-streams/${liveId}`, {
        data: {
          broadcasters: broadcasters.filter(broadcaster => broadcaster.broadcaster_id !== broadcaster_id)
            .map(broadcaster => ({ id: broadcaster.broadcaster_id }))
        }
      });

      queryClient.setQueryData<ILiveStream | undefined>(
        ["liveStream", 'room', liveId], (oldData) => {
          if (!oldData)
            return;

          return {
            ...oldData,
            broadcasters: broadcasters.filter(broadcaster => broadcaster.id !== broadcaster_id)
          };
        }
      )
    } catch (error) {
      console.log(error)
    }
  }, [broadcasters, liveId])

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

              {/* <Tooltip message="Enviar e-mail">
                <button
                  type="button"
                  color="primary"
                  className="d-flex align-items-center gap-2 border-0 bg-transparent "
                >
                  <span className="bx bxs-envelope fs-5" />
                </button>
              </Tooltip> */}

              <ConfirmationModal
                changeStatus={() =>
                  handleRemoveBroadcaster(cellProps.row.original.id)
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
    [handleRemoveBroadcaster]
  );

  return (
    <Card className="shadow-none">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <h4 className="card-title mb-0 fw-bold">Lista de apresentadores</h4>

        <SelectBroadcasterModal broadcasters={broadcasters.map(broadcaster => broadcaster.broadcaster_id)} onSelect={handleInsertBroadcasters}>
          <Button
            color="primary"
            className="d-flex align-items-center gap-2"
            type="button"
          >
            <span className="bx bx-plus fs-5" />
            Inserir nova aprensetadora
          </Button>
        </SelectBroadcasterModal>
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
