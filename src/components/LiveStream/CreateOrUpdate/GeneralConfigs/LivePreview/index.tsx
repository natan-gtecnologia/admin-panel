import { Card } from "@/components/Common/Card";
import { ReactNode, cloneElement, useCallback, useState } from "react";
import { Button, Col, Modal, Row } from "reactstrap";
import { CoverPreview } from "./CoverPreview";

type ChildrenModalProps = {
  toggle: () => void;
};

interface Props {
  children: ReactNode | ((props: ChildrenModalProps) => ReactNode);
}

export function LivePreview({ children }: Props) {
  const [isOpen, setIsOpen] = useState(false);

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
      <Modal
        style={{
          maxWidth: 800,
        }}
        isOpen={isOpen}
        centered
        toggle={() => toggle()}
      >
        <Card className="m-0 shadow-none">
          <Card.Header className="d-flex align-items-center gap-1 justify-content-between">
            <h4 className="m-0 fs-5 fw-bold">Preview</h4>
            <Button onClick={() => toggle()} close />
          </Card.Header>
          <Card.Body>
            <Row>
              <Col className="d-flex flex-column align-items-center">
                <h4 className="fs-6 text-center mb-2 fw-bold">Live</h4>
                <CoverPreview />
              </Col>
              <Col className="d-flex flex-column align-items-center">
                <h4 className="fs-6 text-center mb-2 fw-bold">
                  Imagem da capa
                </h4>
                <CoverPreview hideInfo />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Modal>
    </>
  );
}
