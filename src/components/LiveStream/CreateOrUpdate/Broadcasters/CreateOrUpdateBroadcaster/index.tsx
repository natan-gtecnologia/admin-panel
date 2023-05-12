import { Input } from "@/components/Common/Form/Input";
import { api } from "@/services/apiClient";
import { notNumberMask } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import truncate from "lodash/truncate";
import {
  KeyboardEvent,
  cloneElement,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import Dropzone from "react-dropzone";
import { SubmitHandler, useForm, useFormContext } from "react-hook-form";
import {
  Button,
  Col,
  FormFeedback,
  Label,
  Modal,
  Row,
  Spinner,
} from "reactstrap";
import { z } from "zod";

import { formatBytes } from "@/utils/formatBytes";
import Image from "next/image";
import Link from "next/link";
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
    avatar_id: number | null;
  };
  onSuccess?: () => void | Promise<void>;
};

const createSchema = z
  .object({
    name: z.string().trim().min(3, "Nome é obrigatório"),
    email: z.string().trim().email("Email inválido"),
    avatar: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.avatar || !data.avatar[0]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Imagem é obrigatória",
        path: ["avatar"],
      });
    }
  });

type CreateSchemaType = z.infer<typeof createSchema>;

const DEFAULT_BROADCASTER = {
  name: "",
  email: "",
  id: null,
  avatar_id: null,
};

export function CreateOrUpdateBroadcaster({
  children,
  broadcaster = DEFAULT_BROADCASTER,
  onSuccess,
}: GoBackModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { getValues, setValue } = useFormContext<CreateOrUpdateSchemaType>();
  const {
    handleSubmit,
    register,
    formState,
    setError,
    reset,
    watch,
    setValue: setInnerValue,
  } = useForm<CreateSchemaType>({
    resolver: zodResolver(createSchema),
    defaultValues: broadcaster,
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const liveCover = watch("avatar") as FileList;
  const bgImage = liveCover?.[0]?.name
    ? {
        preview: URL.createObjectURL(liveCover[0]),
        formattedSize: formatBytes(liveCover[0].size),
        name: truncate(liveCover[0].name, {
          length: 28,
        }),
      }
    : null;

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const onCreateBroadcaster = useCallback<SubmitHandler<CreateSchemaType>>(
    async (data) => {
      try {
        let avatar_id = broadcaster.avatar_id;

        if (data.avatar && data.avatar[0]) {
          const uploadFormData = new FormData();
          data.avatar.forEach((file: File) => {
            uploadFormData.append("files", file);
          });

          const response = await api.post("/upload", uploadFormData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          avatar_id = response.data[0].id;
        }

        if (broadcaster.id) {
          await api.put(`/broadcasters/${broadcaster.id}`, {
            data: {
              ...data,
              avatar: avatar_id,
            },
          });
          reset();

          if (onSuccess) {
            await onSuccess();
          }

          setIsOpen(false);
          return;
        }

        const response = await api.post("/broadcasters", {
          data: {
            ...data,
            avatar: avatar_id,
          },
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
    [
      broadcaster.avatar_id,
      broadcaster.id,
      getValues,
      onSuccess,
      reset,
      setError,
      setValue,
    ]
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

            <div className="form-group mb-3">
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

            <div className="form-group">
              <Label htmlFor="liveColor">Imagem</Label>
              <Dropzone
                onDropAccepted={(files) => {
                  setInnerValue("avatar", files);
                }}
                maxFiles={1}
                maxSize={2000000}
                accept={["image/jpeg", "image/png", "image/webp"]}
              >
                {({ getRootProps }) => (
                  <div className="dropzone dz-clickable  d-flex align-items-center justify-content-center">
                    <div className="dz-message needsclick" {...getRootProps()}>
                      <div className="mb-3">
                        <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                      </div>
                      <h4 className="mb-0 fs-5">
                        Solte os arquivos aqui ou clique para fazer o upload.
                      </h4>
                    </div>
                  </div>
                )}
              </Dropzone>
              {formState.errors.avatar && (
                <FormFeedback type="invalid" className="d-block">
                  {formState.errors.avatar.message}
                </FormFeedback>
              )}
              <small className="d-block mt-2 text-muted fs-6">
                Máx. de 2MB. Tamanho recomendado: 1080 x 1920. Formatos aceitos:{" "}
                <br />
                JPG, PNG, WEBP
              </small>

              {bgImage && (
                <Card className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete">
                  <div className="p-2">
                    <Row className="align-items-center">
                      <Col className="col-auto">
                        <Image
                          data-dz-thumbnail=""
                          height="80"
                          width="80"
                          className="avatar-sm rounded bg-light"
                          alt=""
                          src={bgImage.preview}
                        />
                      </Col>
                      <Col className="position-relative">
                        <Link href="#" className="text-muted font-weight-bold">
                          {bgImage.name}
                        </Link>
                        <p className="mb-0">
                          <strong>{bgImage.formattedSize}</strong>
                        </p>

                        <Button
                          close
                          onClick={() => {
                            setInnerValue("avatar", null);
                          }}
                          className="position-absolute top-0 end-0 mt-2 me-3 text-danger"
                        />
                      </Col>
                    </Row>
                  </div>
                </Card>
              )}
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
