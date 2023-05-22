import type { ILiveStream } from "@/@types/livestream";
import { Card } from "@/components/Common/Card";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { api } from "@/services/apiClient";
import { queryClient } from "@/services/react-query";
import { useMutation } from "@tanstack/react-query";
import Router from "next/router";
import { useFormContext } from "react-hook-form";
import { toast } from "react-toastify";
import { Button, Spinner } from "reactstrap";
import { CreateOrUpdateSchemaType } from "../schema";

type Props = {
  liveStream?: ILiveStream | null | undefined;
};

export function Header({ liveStream }: Props) {
  const { watch, formState } = useFormContext<CreateOrUpdateSchemaType>();
  const title = watch("title");
  const id = watch("id");
  const {
    mutateAsync: changeStatus,
    isLoading: isChangingStatus,
    variables,
  } = useMutation<
    void,
    void,
    { status: "enabled" | "disabled" | "testing" | "finished" }
  >({
    mutationFn: async (props) => {
      if (!liveStream) {
        return;
      }

      if (formState.isDirty) {
        toast.warning(
          "Você precisa salvar as alterações antes de mudar o status da live"
        );

        return;
      }

      await api.put(`/live-streams/${id}`, {
        data: {
          state: props.status,
          liveEventName: liveStream.liveEventName,
        },
      });

      await Router.push(`/live-stream/${liveStream?.uuid}`);

      toast.success("Status da live alterado com sucesso");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["live-streams", id]);
    },
  });

  return (
    <Card className="shadow-none rounded-sm">
      <Card.Body className="d-flex align-items-center">
        <h2 className="flex-1 fs-5 fw-bold m-0">{title || "Título da Live"}</h2>

        <div className="d-flex align-items-center gap-2">
          <ConfirmationModal
            changeStatus={() => {
              Router.push("/live-stream");
            }}
            title="Cancelar"
            message={
              id
                ? "Deseja realmente cancelar a edição esta live?"
                : "Deseja realmente cancelar a criação desta live?"
            }
          >
            <Button
              color="danger"
              outline
              type="button"
              className="d-flex align-items-center gap-2 shadow-none"
            >
              <span className="bx bx-x fs-4" />
              Cancelar
            </Button>
          </ConfirmationModal>

          <Button
            color="primary"
            disabled={Object.keys(formState.errors).length > 0}
            outline
            className="d-flex align-items-center gap-2 shadow-none"
          >
            {formState.isSubmitting ? (
              <span className="d-flex align-items-center">
                <Spinner size="sm" className="flex-shrink-0" role="status">
                  Salvando...
                </Spinner>
                <span className="flex-grow-1 ms-2">Salvando...</span>
              </span>
            ) : (
              <>
                <span className="bx bxs-save fs-4" />
                Salvar
              </>
            )}
          </Button>

          <Button
            color="primary"
            type="button"
            className="d-flex align-items-center gap-2 shadow-none"
            disabled={!id || liveStream?.state === "testing"}
            onClick={() => changeStatus({ status: "testing" })}
          >
            {isChangingStatus &&
            variables?.status &&
            variables.status === "testing" ? (
              <Spinner size="sm" className="flex-shrink-0" role="status">
                Mudando...
              </Spinner>
            ) : (
              <>
                <span className="bx bx-play fs-4" />
                Live teste
              </>
            )}
          </Button>

          <Button
            color="success"
            type="button"
            className="d-flex align-items-center gap-2 shadow-none"
            disabled={!id || liveStream?.state === "enabled"}
            onClick={() => changeStatus({ status: "enabled" })}
          >
            {isChangingStatus &&
            variables?.status &&
            variables.status === "testing" ? (
              <Spinner size="sm" className="flex-shrink-0" role="status">
                Mudando...
              </Spinner>
            ) : (
              <>
                <span className="bx bx-play fs-4" />
                Iniciar live
              </>
            )}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
