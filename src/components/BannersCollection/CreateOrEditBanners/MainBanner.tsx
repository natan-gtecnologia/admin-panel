import { Card } from "@growth/growforce-admin-ui/components/Common/Card";
import { useFormContext } from "react-hook-form";
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';

import {
    Col,
    FormFeedback,
    Label,
    Row,
} from 'reactstrap';
import { CreateOrUpdateBannerSchemaProps } from "./schema";
import clsx from "clsx";

export function MainBanner() {
    const { formState, register } = useFormContext<CreateOrUpdateBannerSchemaProps>()

    return (
        <Card>
            <Card.Body>
                <Row>
                    <Col md={12}>
                        <div className="d-flex align-items-center">
                            <h6 className="card-title mb-1">Coleção de banners</h6>
                        </div>
                        <p>Mude aqui sua coleção de banner</p>
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <Label className="form-label" htmlFor="title">
                            Título
                        </Label>
                        <Input
                            type="text"
                            id="title"
                            placeholder="Título do banner"
                            invalid={!!formState.errors.title}
                            {...register('title')}
                        />
                        {formState.errors.title && (
                            <FormFeedback type="invalid">
                                {formState.errors.title.message}
                            </FormFeedback>
                        )}
                    </Col>

                    <Col md={6}>
                        <div>
                            <Label className="form-label" htmlFor="page">
                                Página de banner
                            </Label>
                            <select
                                className={clsx('form-select', {
                                    'is-invalid': !!formState.errors.page,
                                })}
                                aria-label=""
                                id="type"
                                {...register('page')}
                            >
                                <option value=""></option>
                                <option value="layout">Layout</option>
                                <option value="homepage">Homepage</option>
                                <option value="products">Products</option>
                                <option value="product">Product</option>
                            </select>

                            {!!formState.errors.page && (
                                <FormFeedback type="invalid">
                                    {formState.errors.page.message}
                                </FormFeedback>
                            )}
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    )
}