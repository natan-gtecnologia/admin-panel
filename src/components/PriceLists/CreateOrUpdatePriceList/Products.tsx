import { faPlus } from '@fortawesome/pro-light-svg-icons/faPlus';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button, Col, FormFeedback, Row } from 'reactstrap';
import { Add } from './Add';
import { CreateOrUpdatePriceListSchema } from './schema';

export function Products() {
  const { control, formState } =
    useFormContext<CreateOrUpdatePriceListSchema>();
  const { append, fields, remove } = useFieldArray({
    control,
    name: 'productPrices',
  });

  return (
    <Card>
      <Card.Body>
        <Row className="align-items-center">
          <Col>
            <h4 className="fs-5 text-body m-0 fw-bold">Produtos</h4>
            <p>Insira os produtos que serão vendidos com os respectivos</p>
          </Col>

          <Col lg={1}>
            <Button
              onClick={() =>
                append({
                  product: null,
                  price: {
                    regularPrice: 0,
                    salePrice: 0,
                  },
                })
              }
            >
              <FontAwesomeIcon
                icon={faPlus}
                style={{
                  width: 16,
                  height: 16,
                }}
              />
            </Button>
          </Col>
        </Row>

        {fields.map((field, index) => (
          <Add key={field.id} fieldIndex={index} onRemove={remove} />
        ))}

        {formState.errors.productPrices && (
          <FormFeedback type="invalid" className="d-block">
            {formState.errors.productPrices.message}
          </FormFeedback>
        )}
      </Card.Body>
    </Card>
  );
}
