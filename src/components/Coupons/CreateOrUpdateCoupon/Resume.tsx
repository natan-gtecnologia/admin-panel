import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';
import { useFormContext } from 'react-hook-form';
import { CreateOrUpdateCouponSchemaProps } from './schema';

export function Resume() {
  const { watch } = useFormContext<CreateOrUpdateCouponSchemaProps>();
  const code = watch('code');
  const method = watch('method');
  const type = watch('type');
  const shippingType = watch('shippingType');
  const discountType = watch('discountType');
  const initialDate = watch('initialDate');
  const finalDate = watch('finalDate');
  const minimumCartAmount = watch('minimumCartAmount');
  const minimumProductQuantity = watch('minimumProductQuantity');
  const accumulative = watch('accumulative');

  return (
    <Card className="shadow-none">
      <Card.Header>
        <h4 className="fs-5 text-body m-0 fw-bold">Resumo</h4>
      </Card.Header>

      <Card.Body>
        {code && <p className="fs-6 fw-bold mb-3 text-body">{code}</p>}

        <div className="mb-3">
          <h5
            className="fw-bold mb-2"
            style={{
              fontSize: '0.875rem',
            }}
          >
            Tipo e forma
          </h5>

          <ul className="d-flex flex-column gap-1 m-0 text-muted ps-4">
            {shippingType === 'free_shipping' && <li>Frete grátis</li>}
            <li>{method === 'auto' ? 'Automático' : 'Código'}</li>
            {shippingType === 'not_apply' && discountType === 'price' && (
              <li>Valor de desconto no pedido</li>
            )}
            {shippingType === 'not_apply' && discountType === 'percentage' && (
              <li>Porcentagem de desconto no pedido</li>
            )}
          </ul>
        </div>

        <div>
          <h5
            className="fw-bold mb-2"
            style={{
              fontSize: '0.875rem',
            }}
          >
            Informações
          </h5>

          <ul className="d-flex flex-column gap-1 m-0 text-muted ps-4">
            {!accumulative ? (
              <li>Não é possível combinar com outros descontos</li>
            ) : (
              <li>Pode combinar com outros descontos</li>
            )}
            {shippingType === 'free_shipping' && (
              <li>Frete grátis para todos os produtos</li>
            )}
            {!minimumCartAmount && !minimumProductQuantity && (
              <li>Nenhum requisito mínimo de compra</li>
            )}
            {initialDate && (
              <li>
                Ativo a partir de{' '}
                {format(new Date(initialDate), "dd 'de' MMM", {
                  locale: ptBR,
                })}
                .
              </li>
            )}
            {finalDate && (
              <li>
                Ativo até{' '}
                {format(new Date(finalDate), "dd 'de' MMM", {
                  locale: ptBR,
                })}
                .
              </li>
            )}
          </ul>
        </div>
      </Card.Body>
    </Card>
  );
}
