import clsx from 'clsx';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { Collapse } from 'reactstrap';
import { IOrder } from '../../@types/order';

type OrderStatusProps = {
  isOpen: boolean;
  onToggle: (target: string) => void;
  trackingEvent: IOrder['shipping']['trackingEvents'][0];
  method?: string;
  trackingCode?: string;
};

const event = {
  added: 'Pedido adicionado',
  collected: 'Coletado pelo transportador',
  movement: 'Em movimento entre os centros de distribuição',
  onroute: 'Saiu para entrega',
  delivered: 'Entregue',
};

const description = {
  added: 'Seu item foi entregue aos correios',
  collected: 'Seu item foi coletado pelo transportador',
  movement: 'Seu item está em movimento entre os centros de distribuição',
  onroute: 'Seu item está a caminho',
  delivered: 'Seu item foi entregue',
};

export function OrderStatus({
  isOpen,
  onToggle,
  trackingEvent,

  method = '',
  trackingCode = '',
}: OrderStatusProps) {
  return (
    <div
      className="accordion-item border-0"
      onClick={() => onToggle(trackingEvent.sk_event)}
    >
      <div
        className="accordion-header"
        id={trackingEvent.sk_event}
        onClick={() => onToggle(trackingEvent.sk_event)}
      >
        <button
          className={clsx('accordion-button', 'p-2', 'shadow-none', {
            collapsed: !isOpen,
          })}
          onClick={() => onToggle(trackingEvent.sk_event)}
        >
          <div className="d-flex align-items-center">
            <div className="flex-shrink-0 avatar-xs">
              {trackingEvent.tag === 'added' && (
                <div className="avatar-title bg-success rounded-circle">
                  <i className="ri-shopping-bag-line"></i>
                </div>
              )}
              {trackingEvent.tag === 'collected' && (
                <div className="avatar-title bg-success rounded-circle">
                  <i className="mdi mdi-gift-outline"></i>
                </div>
              )}
              {trackingEvent.tag === 'movement' && (
                <div className="avatar-title bg-success rounded-circle">
                  <i className="ri-truck-line"></i>
                </div>
              )}
              {trackingEvent.tag === 'onroute' && (
                <div className="avatar-title bg-light text-success rounded-circle">
                  <i className="ri-takeaway-fill"></i>
                </div>
              )}
              {trackingEvent.tag === 'delivered' && (
                <div className="avatar-title bg-light text-success rounded-circle">
                  <i className="mdi mdi-package-variant"></i>
                </div>
              )}
            </div>
            <div className="flex-grow-1 ms-3">
              <h6 className="fs-15 mb-1 fw-semibold">
                {event[trackingEvent.tag]}
                {/*Shipping - <span className="fw-normal">Thu, 16 Dec 2021</span>*/}
              </h6>
            </div>
          </div>
        </button>
      </div>
      {['added', 'collected', 'movement'].includes(trackingEvent.tag) && (
        <Collapse
          id="collapseThree"
          className="accordion-collapse"
          isOpen={isOpen}
        >
          <div className="accordion-body ms-2 ps-5 pt-0">
            {(method || trackingCode) && (
              <h6 className="fs-14">
                {method}
                {method && trackingCode && ' - '}
                {trackingCode}
              </h6>
            )}
            <h6 className="mb-1">{description[trackingEvent.tag]}</h6>
            <p className="text-muted mb-0">
              {format(new Date(trackingEvent.date), 'dd/MM/yyyy HH:mm:ss', {
                locale: ptBR,
              })}
            </p>
          </div>
        </Collapse>
      )}
    </div>
  );
}
