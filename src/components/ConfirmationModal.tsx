import { cloneElement, useState, type ReactNode } from "react";
import { Button, Modal, Spinner } from "reactstrap";
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
  const [isChanging, setIsChanging] = useState(false)

  const toggle = (data?: string | number | null | undefined) => {
    if (isChanging) return;

    setIsOpen(!isOpen);
    setDataChildren(data);
  };

  const handleConfirmation = async () => {
    try {
      setIsChanging(true)
      await changeStatus(dataChildren);
      toggle();
    } catch (error) { } finally {
      setIsChanging(false)
    }
  };

  return (
    <>
      {typeof children !== "function"
        ? cloneElement(children as React.ReactElement, { onClick: toggle })
        : children({
          toggle,
        })}
      <Modal isOpen={isOpen} centered toggle={() => toggle()}>
        <Card className="m-0 shadow-none">
          <Card.Header className="d-flex align-items-center gap-1 justify-content-between border-0">
            <h4 className="m-0 fs-5 fw-bold">{title}</h4>
            <Button onClick={() => toggle()} close />
          </Card.Header>
          <Card.Body className="pt-0 pb-0">
            <p className="m-0">{message}</p>
          </Card.Body>

          <Card.Footer className="d-flex align-items-center gap-2 justify-content-end border-0">
            <Button
              onClick={() => toggle()}
              color="light"
              className="shadow-none"
            >
              Cancelar
            </Button>
            <Button
              color="danger"
              className="shadow-none"
              onClick={handleConfirmation}
            >
              {isChanging ? (
                <span className="d-flex align-items-center">
                  <Spinner size="sm" className="flex-shrink-0" role="status">
                    Alterando...
                  </Spinner>
                  <span className="flex-grow-1 ms-2">Alterando...</span>
                </span>
              ) : 'Confirmar'}
            </Button>
          </Card.Footer>
        </Card>
      </Modal>
    </>
  );
}
