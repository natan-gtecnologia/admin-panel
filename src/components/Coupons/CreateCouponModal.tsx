import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import Link from 'next/link';
import { Modal } from 'reactstrap';

type Props = {
  open: boolean;
  onToggle: () => void;
};

export function CreateCouponModal({ onToggle, open }: Props) {
  return (
    <Modal isOpen={open} toggle={onToggle} centered>
      <Card className="m-0">
        <Card.Header>
          <h2 className="m-0">Selecione o tipo de desconto</h2>
        </Card.Header>
        <Link
          href="/coupons/create?type=product-quantity"
          className="border-bottom border-1 p-3"
        >
          <h6 className="mb-1">Quantidade de produtos</h6>
          <small className="text-muted fs-6">Desconto de produto</small>
        </Link>
        <Link
          href="/coupons/create?type=value"
          className="border-bottom border-1 p-3"
        >
          <h6 className="mb-1">Valor fora do pedido</h6>
          <small className="text-muted fs-6">Desconto de pedido</small>
        </Link>
        <Link
          href="/coupons/create?type=buy_and_earn"
          className="border-bottom border-1 p-3"
        >
          <h6 className="mb-1">Compre X ganhe Y</h6>
          <small className="text-muted fs-6">Desconto de envio</small>
        </Link>
        <Link
          href="/coupons/create?type=free_shipping"
          className="border-bottom border-1 p-3"
        >
          <h6 className="mb-1">Envio grátis</h6>
          <small className="text-muted fs-6">Desconto de envio</small>
        </Link>
      </Card>
    </Modal>
  );
}
