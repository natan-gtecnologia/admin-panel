import { useState } from 'react';
import { Button } from 'reactstrap';
import { CreateCouponModal } from './CreateCouponModal';

export function NoCoupon() {
  const [modal, setModal] = useState(false);

  const toggle = () => setModal((oldState) => !oldState);

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center border border-1 rounded p-8"
      style={{
        maxWidth: 568,
        padding: '70px 45px',
      }}
    >
      <div className="text-center">
        <span
          className="d-flex mx-auto align-items-center justify-content-center rounded-pill"
          style={{
            background: '#F3F6F9',
            color: '#405189',
            fontSize: 21,
            height: 72,
            width: 72,
          }}
        >
          <i className="mdi mdi-tag-multiple-outline" />
        </span>
        <h4 className="mt-4">Você ainda não possui nenhum cupom cadastrado</h4>
        <p className="text-muted">
          Crie códigos de desconto e descontos automáticos para aplicar os seus
          clientes utilizarem no no checkout.
        </p>
        <Button onClick={toggle} color="success">
          Criar cupom
        </Button>

        <CreateCouponModal open={modal} onToggle={toggle} />
      </div>
    </div>
  );
}
