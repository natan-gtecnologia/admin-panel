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
                            <h6 className="card-title mb-1">Banner principal</h6>
                        </div>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque, dolorum.</p>
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
                        <Label className="form-label" htmlFor="page_link">
                            Link da página
                        </Label>
                        <Input
                            type="text"
                            id="page_link"
                            placeholder="Link da página"
                            invalid={!!formState.errors.page_link}
                            {...register('page_link')}
                        />
                        {formState.errors.page_link && (
                            <FormFeedback type="invalid">
                                {formState.errors.page_link.message}
                            </FormFeedback>
                        )}
                    </Col>
                </Row>

                <Row className="mt-3">
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

                    <Col md={6}>
                        <div>
                            <Label className="form-label" htmlFor="type">
                                Local de exibição
                            </Label>
                            <select
                                className={clsx('form-select', {
                                    'is-invalid': !!formState.errors.type,
                                })}
                                aria-label=""
                                id="type"
                                {...register('type')}
                            >
                                <option value=""></option>
                                <option value="hero">Hero</option>
                                <option value="section">Section</option>
                            </select>

                            {!!formState.errors.type && (
                                <FormFeedback type="invalid">
                                    {formState.errors.type.message}
                                </FormFeedback>
                            )}
                        </div>
                    </Col>
                </Row>

                <Row className="mt-3">
                    <Col md={6}>
                        <Label className="form-label" htmlFor="order">
                            Ordem
                        </Label>
                        <Input
                            id="order"
                            name='order'
                            type='number'
                            invalid={!!formState.errors.order}
                            {...register('order', {
                                valueAsNumber: true,
                            })}
                        />
                        {formState.errors.order && (
                            <FormFeedback type="invalid">
                                {formState.errors.order.message}
                            </FormFeedback>
                        )}
                    </Col>

                    <Col md={6}>
                        <div>
                            <Label className="form-label" htmlFor="link_type">
                                Tipo de link
                            </Label>
                            <select
                                className={clsx('form-select', {
                                    'is-invalid': !!formState.errors.link_type,
                                })}
                                aria-label=""
                                id="link_type"
                                {...register('link_type')}
                            >
                                <option value=""></option>
                                <option value="product">Product</option>
                                <option value="category">Category</option>
                                <option value="page">Page</option>
                            </select>

                            {!!formState.errors.link_type && (
                                <FormFeedback type="invalid">
                                    {formState.errors.link_type.message}
                                </FormFeedback>
                            )}
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    )
}