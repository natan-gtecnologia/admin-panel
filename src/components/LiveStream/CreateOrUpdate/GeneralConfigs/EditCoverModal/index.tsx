import { Card } from "@/components/Common/Card";
import { Input } from "@/components/Common/Form/Input";
import truncate from "lodash/truncate";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, cloneElement, useCallback, useState } from "react";
import Dropzone from "react-dropzone";
import { useFormContext } from "react-hook-form";
import { Button, Col, Label, Modal, Row } from "reactstrap";
import { CreateOrUpdateSchemaType } from "../../schema";

type ChildrenModalProps = {
  toggle: () => void;
};

interface Props {
  children: ReactNode | ((props: ChildrenModalProps) => ReactNode);
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function EditCover({ children }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { register, setValue, formState, watch } =
    useFormContext<CreateOrUpdateSchemaType>();
  const liveCover = watch("liveCover") as FileList;
  const bgImage = liveCover?.[0]?.name
    ? {
        preview: URL.createObjectURL(liveCover[0]),
        formattedSize: formatBytes(liveCover[0].size),
        name: truncate(liveCover[0].name, {
          length: 28,
        }),
      }
    : null;

  const toggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

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
            <h4 className="m-0 fs-5 fw-bold">Fundo de capa da live</h4>
            <Button
              onClick={() => {
                setValue("liveCover", null);
                setValue("liveColor", "#DB7D72");
                toggle();
              }}
              close
            />
          </Card.Header>
          <Card.Body className="pt-0 pb-0">
            <p className="mb-4">
              O desconto pode ser inserido de forma monetária ou percentual,
              sendo exclusivo apenas para a live. O valor será calculado
              automaticamente e aplicado ao total.
            </p>

            <div className="form-group mb-3">
              <Label htmlFor="liveColor">Cor sólida</Label>
              <Input
                className="form-control"
                id="liveColor"
                type="color"
                {...register("liveColor")}
                invalid={!!formState.errors.liveColor}
                error={formState.errors.liveColor?.message}
                style={{
                  height: "40px",
                }}
              />
            </div>

            <div className="form-group">
              <Label htmlFor="liveColor">Imagem</Label>
              <Dropzone
                onDropAccepted={(files) => {
                  setValue("liveCover", files);
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
                      <Col>
                        <Link href="#" className="text-muted font-weight-bold">
                          {bgImage.name}
                        </Link>
                        <p className="mb-0">
                          <strong>{bgImage.formattedSize}</strong>
                        </p>
                      </Col>
                    </Row>
                  </div>
                </Card>
              )}
            </div>
          </Card.Body>
          <Card.Footer className="d-flex align-items-center gap-2 justify-content-end border-0">
            <Button
              onClick={() => {
                setValue("liveCover", null);
                setValue("liveColor", "#DB7D72");
                toggle();
              }}
              color="light"
              className="shadow-none"
              type="button"
            >
              Cancelar
            </Button>
            <Button
              color="primary"
              className="shadow-none"
              type="button"
              onClick={() => {
                toggle();
              }}
            >
              Salvar
            </Button>
          </Card.Footer>
        </Card>
      </Modal>
    </>
  );
}
