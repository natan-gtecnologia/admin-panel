import React, { useCallback } from "react";
import { Col, Container, Label, Row, FormFeedback, Button } from "reactstrap";
import BreadCrumb from "@/components/Common/BreadCrumb";
import Layout from "@/containers/Layout";
import { Card } from "@/components/Common/Card";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/Common/Form/Input";

const DEFAULT: any = {
  nome: "",
  email: "",
  crm: "",
  uf: "",
};

const createOrUpdateSchema = z.object({
  name: z.string().trim().min(3, "Mínimo de 3 caracteres"),
  email: z.string().email("Email inválido"),
  crm: z.string(),
  uf: z.string(),
});

const Usuario = () => {
  
  const formProps = useForm({
    resolver: zodResolver(createOrUpdateSchema),
    defaultValues: DEFAULT,
  });
  const { handleSubmit, reset, register, formState } = formProps;

  const createUser = useCallback(async (values: any) => {
    console.log(values);
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Cadastro" pageTitle="Usuário" />
          <Row>
            <Col xs={8}>
              <Card>
                <Card.Header>
                  <h6 className="card-title mb-0 flex-grow-1">
                    Cadastro de Usuário
                  </h6>
                </Card.Header>

                <Card.Body>
                  <FormProvider {...formProps}>
                    <form onSubmit={handleSubmit(createUser)}>
                      <Row>
                        <Col md={6}>
                          <div className="form-group">
                            <Label htmlFor="name">Nome</Label>
                            <Input
                              type="text"
                              className="form-control"
                              id="name"
                              {...register("name")}
                              placeholder="Nome Completo"
                              invalid={!!formState.errors.name}
                            />
                            {formState.errors.name?.message && (
                              <FormFeedback type="invalid">
                                {formState.errors.name?.message}
                              </FormFeedback>
                            )}
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="form-group">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                              type="text"
                              className="form-control"
                              id="email"
                              {...register("email")}
                              placeholder="E-mail"
                              invalid={!!formState.errors.email}
                            />
                            {formState.errors.email?.message && (
                              <FormFeedback type="invalid">
                                {formState.errors.email?.message}
                              </FormFeedback>
                            )}
                          </div>
                        </Col>
                      </Row>

                      <Row className="mt-2">
                        <Col md={6}>
                          <div className="form-group">
                            <Label htmlFor="crm">CRM</Label>
                            <Input
                              type="text"
                              className="form-control"
                              id="crm"
                              {...register("crm")}
                              placeholder="CRM"
                              invalid={!!formState.errors.crm}
                            />
                            {formState.errors.crm?.message && (
                              <FormFeedback type="invalid">
                                {formState.errors.crm?.message}
                              </FormFeedback>
                            )}
                          </div>
                        </Col>

                        <Col md={6}>
                          <div className="form-group">
                            <Label htmlFor="uf">UF</Label>
                            <select
                              className="form-select mb-3"
                              aria-label=".form-select-lg example"
                              {...register("uf")}
                            >
                              <option selected></option>
                              <option value="es">ES</option>
                              <option value="rj">RJ</option>
                              <option value="sp">SP</option>
                            </select>
                          </div>
                        </Col>
                      </Row>

                      <div className="mt-2 d-flex justify-content-end gap-3">
                        <Button
                          type="button"
                          onClick={() => alert("Será desenvolvido em breve")}
                          color="warning"
                          className="d-flex align-items-center"
                        >
                          Alterar senha
                        </Button>

                        <Button
                          type="submit"
                          color="success"
                          className="d-flex align-items-center"
                        >
                          Salvar
                        </Button>
                      </div>
                    </form>
                  </FormProvider>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Header>Teste</Card.Header>
                <Card.Body>
                  Conteudo aqui
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Usuario;

Usuario.getLayout = (page: any, logo: any) => <Layout logo={logo}>{page}</Layout>;
