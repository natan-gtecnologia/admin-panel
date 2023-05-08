import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { useFormContext } from 'react-hook-form';
import { CreateOrUpdateTagsSchemaProps } from './schema';

export function Information() {

  return (
    <Card className="shadow-none">
      <Card.Header>
        <h4 className="fs-5 text-body m-0 fw-bold">Informação</h4>
      </Card.Header>

      <Card.Body>
        <div className="mb-3 d-flex align-items-center justify-content-between">
          <h5
            className="fw-bold"
            style={{
              fontSize: '0.875rem',
              marginBottom: '0'
            }}
          >
            Criada
          </h5>

          <p className='mb-0'>12/09/2022</p>
        </div>

        <div className="mb-3 d-flex align-items-center justify-content-between">
          <h5
            className="fw-bold"
            style={{
              fontSize: '0.875rem',
              marginBottom: '0'
            }}
          >
            Por
          </h5>

          <p className='mb-0'>Nalu nalu</p>
        </div>
        <div className="mb-3 d-flex align-items-center justify-content-between">
          <h5
            className="fw-bold"
            style={{
              fontSize: '0.875rem',
              marginBottom: '0'
            }}
          >
            Última atualização
          </h5>

          <p className='mb-0'>12/09/2022</p>
        </div>
        <div className="mb-3 d-flex align-items-center justify-content-between">
          <h5
            className="fw-bold"
            style={{
              fontSize: '0.875rem',
              marginBottom: '0'
            }}
          >
            Por
          </h5>

          <p className='mb-0'>Nalu nalu</p>
        </div>

      </Card.Body>
    </Card>
  );
}
