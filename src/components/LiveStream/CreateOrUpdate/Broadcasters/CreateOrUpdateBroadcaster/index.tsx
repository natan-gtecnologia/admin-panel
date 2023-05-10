import { Input } from "@/components/Common/Form/Input";
import { api } from "@/services/apiClient";
import { notNumberMask } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  KeyboardEvent,
  cloneElement,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { SubmitHandler, useForm, useFormContext } from "react-hook-form";
import { Button, Label, Modal, Spinner } from "reactstrap";
import { z } from "zod";
import { Card } from "../../../../Common/Card";
import type { CreateOrUpdateSchemaType } from "../../schema";

type ChildrenModalProps = {
  toggle: () => void;
};

type GoBackModalProps = {
  children: ReactNode | ((props: ChildrenModalProps) => ReactNode);
  broadcaster?: {
    id: number | null;
    name: string;
    email: string;
  };
  onSuccess?: () => void | Promise<void>;
};

const createSchema = z.object({
  name: z.string().trim().min(3, "Nome é obrigatório"),
  email: z.string().trim().email("Email inválido"),
});

type CreateSchemaType = z.infer<typeof createSchema>;

const DEFAULT_BROADCASTER = {
  name: "",
  email: "",
  id: null,
};

export function CreateOrUpdateBroadcaster({
  children,
  broadcaster = DEFAULT_BROADCASTER,
  onSuccess,
}: GoBackModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { getValues, setValue } = useFormContext<CreateOrUpdateSchemaType>();
  const { handleSubmit, register, formState, setError, reset } =
    useForm<CreateSchemaType>({
      resolver: zodResolver(createSchema),
      defaultValues: broadcaster,
      mode: "onChange",
      reValidateMode: "onChange",
    });

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const onCreateBroadcaster = useCallback<SubmitHandler<CreateSchemaType>>(
    async (data) => {
      try {
        if (broadcaster.id) {
          await api.put(`/broadcasters/${broadcaster.id}`, {
            data,
          });
          reset();

          if (onSuccess) {
            await onSuccess();
          }

          setIsOpen(false);
          return;
        }

        const response = await api.post("/broadcasters", {
          data,
        });

        const id = response.data?.data?.id;

        const broadcasters = getValues("broadcasters");

        setValue("broadcasters", [...broadcasters, id]);
        reset();
        setIsOpen(false);
      } catch (error) {
        setError("name", {
          type: "manual",
          message: "Erro ao criar apresentador(a)",
        });
      }
    },
    [broadcaster.id, getValues, onSuccess, reset, setError, setValue]
  );

  const handleSubmitOnEnter = useCallback(
    (event: KeyboardEvent<HTMLFormElement>) => {
      if (event.key === "Enter") {
        handleSubmit(onCreateBroadcaster)();
      }
    },
    [handleSubmit, onCreateBroadcaster]
  );

  return (
    <>
      {typeof children !== "function"
        ? cloneElement(children as React.ReactElement, { onClick: toggle })
        : children({
            toggle,
          })}
      <Modal isOpen={isOpen} centered>
        <Card className="m-0 shadow-none">
          <Card.Header className="d-flex align-items-center gap-1 justify-content-between border-0">
            <h4 className="m-0 fs-5 fw-bold">Inserir apresentador(a)</h4>
            <Button onClick={toggle} close />
          </Card.Header>

          <Card.Body className="pt-0 pb-0">
            <p>
              O desconto pode ser inserido de forma monetária ou percentual,
              sendo exclusivo apenas para a live. O valor será calculado
              automaticamente e aplicado ao total.{" "}
            </p>

            <div className="form-group mb-3">
              <Label htmlFor="name">Nome</Label>
              <Input
                className="form-control"
                id="name"
                {...register("name", {
                  onChange: notNumberMask.onChange,
                })}
                invalid={!!formState.errors.name}
                error={formState.errors.name?.message}
                onKeyUp={handleSubmitOnEnter}
                placeholder="Nome do apresentador(a)"
              />
            </div>

            <div className="form-group">
              <Label htmlFor="email">Email</Label>
              <Input
                className="form-control"
                id="email"
                {...register("email")}
                invalid={!!formState.errors.email}
                error={formState.errors.email?.message}
                onKeyUp={handleSubmitOnEnter}
                placeholder="email@liveforce.com.br"
              />
            </div>
          </Card.Body>

          <Card.Footer className="d-flex align-items-center gap-2 justify-content-end border-0">
            <Button
              onClick={toggle}
              color="light"
              className="shadow-none"
              type="button"
            >
              Cancelar
            </Button>
            <Button
              className="shadow-none"
              type="button"
              onClick={handleSubmit(onCreateBroadcaster)}
              loa
            >
              {formState.isSubmitting ? (
                <span className="d-flex align-items-center">
                  <Spinner size="sm" className="flex-shrink-0" role="status">
                    Inserindo...
                  </Spinner>
                  <span className="flex-grow-1 ms-2">Inserindo...</span>
                </span>
              ) : (
                "Inserir"
              )}
            </Button>
          </Card.Footer>
        </Card>
      </Modal>
    </>
  );
}
