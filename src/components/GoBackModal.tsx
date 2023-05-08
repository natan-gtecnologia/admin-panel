import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import Link from 'next/link';
import { cloneElement, useState } from 'react';
import { Button, Modal } from 'reactstrap';

type GoBackModalProps = {
  children: React.ReactNode;
  backPage: string;
};

export function GoBackModal({ children, backPage }: GoBackModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <>
      {cloneElement(children as React.ReactElement, { onClick: toggle })}
      <Modal isOpen={isOpen} centered toggle={toggle}>
        <Card className="m-0">
          <Card.Header className="d-flex align-items-center gap-1 justify-content-between">
            <h4 className="m-0 fs-5">Tem certeza?</h4>
            <Button onClick={toggle} close />
          </Card.Header>
          <Card.Body>
            <p className="m-0">
              Ao clicar em voltar todas as alterações realizadas desde o último
              salvamento serão perdidas
            </p>
          </Card.Body>

          <Card.Footer className="d-flex align-items-center gap-2 justify-content-end">
            <Button onClick={toggle} color="light">
              Cancelar
            </Button>
            <Link href={backPage}>
              <Button color="danger">Confirmar</Button>
            </Link>
          </Card.Footer>
        </Card>
      </Modal>
    </>
  );
}
