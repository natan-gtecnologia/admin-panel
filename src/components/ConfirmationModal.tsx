import { cloneElement, useState, type ReactNode } from "react";
import { Button, Modal } from "reactstrap";
import { Card } from "./Common/Card";

type ChildrenModalProps = {
  toggle: (data?: string | number | null | undefined) => void;
};

type GoBackModalProps = {
  children: ReactNode | ((props: ChildrenModalProps) => ReactNode);
  changeStatus: (value?: any) => Promise<void> | void;
  title?: string;
  message?: string;
};

export function ConfirmationModal({
  children,
  changeStatus,

  title = "Tem certeza?",
  message = "Você está alterando o status. Ao clicar em confirmar, o produto será alterado para o status selecionado.",
}: GoBackModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dataChildren, setDataChildren] = useState<
    string | number | null | undefined
  >(null);

  const toggle = (data?: string | number | null | undefined) => {
    setIsOpen(!isOpen);
    setDataChildren(data);
  };

  const handleConfirmation = async () => {
    await changeStatus(dataChildren);
    toggle();
  };

  return (
    <>
      {typeof children !== "function"
        ? cloneElement(children as React.ReactElement, { onClick: toggle })
        : children({
            toggle,
          })}
      <Modal isOpen={isOpen} centered toggle={() => toggle()}>
        <Card className="m-0">
          <Card.Header className="d-flex align-items-center gap-1 justify-content-between">
            <h4 className="m-0 fs-5">{title}</h4>
            <Button onClick={() => toggle()} close />
          </Card.Header>
          <Card.Body>
            <p className="m-0">{message}</p>
          </Card.Body>

          <Card.Footer className="d-flex align-items-center gap-2 justify-content-end">
            <Button onClick={() => toggle()} color="light">
              Cancelar
            </Button>
            <Button color="danger" onClick={handleConfirmation}>
              Confirmar
            </Button>
          </Card.Footer>
        </Card>
      </Modal>
    </>
  );
}
