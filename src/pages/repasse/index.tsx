import React, { useCallback, useMemo } from "react";
import { Col, Container, Label, Row, FormFeedback, Button } from "reactstrap";
import BreadCrumb from "@/components/Common/BreadCrumb";
import Layout from "@/containers/Layout";
import { Card } from "@/components/Common/Card";
import { Input } from "@/components/Common/Form/Input";
import TableContainer from "@/components/Common/TableContainer";
import Link from "next/link";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { Tooltip } from "@/components/Common/Tooltip";

const DEFAULT: any = {
  nome: "",
  email: "",
  crm: "",
  uf: "",
};

const dataTable = [
  {
    id: 1,
    data: "01/01/2021",
    paciente: "Lucas",
    procedimento: "Qualquer",
    dataConvenio: "28/02/2000",
    dataParticular: "28/02/2015",
    vltConvenio: "R$ 00,00",
    vltParticular: "R$ 00,00",
    vltTotal: "R$ 00,00",
  },
  {
    id: 2,
    data: "01/01/2020",
    paciente: "João",
    procedimento: "Outro",
    dataConvenio: "28/02/2012",
    dataParticular: "28/02/2015",
    vltConvenio: "R$ 00,00",
    vltParticular: "R$ 00,00",
    vltTotal: "R$ 00,00",
  },
  {
    id: 3,
    data: "01/01/2022",
    paciente: "David",
    procedimento: "Novo",
    dataConvenio: "28/02/2015",
    dataParticular: "28/02/2015",
    vltConvenio: "R$ 00,00",
    vltParticular: "R$ 00,00",
    vltTotal: "R$ 00,00",
  },
];

const Repasse = () => {
  const columns = useMemo(
    () => [
      {
        Header: "Data",
        accessor: "data",
      },
      {
        Header: "Paciente",
        accessor: "paciente",
      },
      {
        Header: "Procedimento",
        accessor: "procedimento",
      },
      {
        Header: "Dt Convênio",
        accessor: "dataConvenio",
      },
      {
        Header: "Dt Particular",
        accessor: "dataParticular",
      },
      {
        Header: "Vlt Convênio",
        accessor: "vltConvenio",
      },
      {
        Header: "Vlt Particular",
        accessor: "vltParticular",
      },
      {
        Header: "Vlt Total",
        accessor: "vltTotal",
      },
      {
        Header: "Ações",
        canSort: false,
        Cell: (cellProps: any) => {
          return (
            <div className="d-flex gap-3">
              <div className="edit d-flex align-items-center">
                <Link
                  href={"#"}
                  className="cursor-pointer"
                  aria-label="Editar live-stream"
                >
                  <i className="ri-pencil-fill"></i>
                </Link>
              </div>

              <ConfirmationModal
                changeStatus={() => {}}
                title="Remover repasse"
                message="Deseja realmente remover este repasse? A ação não poderá ser desfeita e qualquer alteração será cancelada."
              >
                <button
                  type="button"
                  className="d-flex align-items-center gap-2 border-0 bg-transparent text-danger"
                >
                  <Tooltip message="Remover repasse">
                    <span className="bx bxs-x-circle fs-5" />
                  </Tooltip>
                </button>
              </ConfirmationModal>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Repasse" pageTitle="Repasse" />
          <Row>
            <Col xs={12}>
              <Card>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <div>
                        <Label
                          htmlFor="exampleInputdate"
                          className="form-label"
                        >
                          De
                        </Label>
                        <Input
                          type="date"
                          className="form-control"
                          id="exampleInputdate"
                        />
                      </div>
                    </Col>

                    <Col md={4}>
                      <div>
                        <Label
                          htmlFor="exampleInputdate"
                          className="form-label"
                        >
                          Até
                        </Label>
                        <Input
                          type="date"
                          className="form-control"
                          id="exampleInputdate"
                        />
                      </div>
                    </Col>

                    <Col md={4}>
                      <div className="form-group">
                        <Label htmlFor="uf">Realizado?</Label>
                        <select
                          className="form-select mb-3"
                          aria-label=".form-select-lg example"
                          // {...register("uf")}
                        >
                          <option selected></option>
                          <option value="true">Sim</option>
                          <option value="false">Não</option>
                        </select>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={12}>
                  <div className="mt-2 d-flex justify-content-end gap-3">
                        <Button
                          type="button"
                          onClick={() => alert("Será desenvolvido em breve")}
                          color="warning"
                          className="d-flex align-items-center"
                        >
                          Limpar
                        </Button>

                        <Button
                          type="submit"
                          color="success"
                          className="d-flex align-items-center"
                        >
                          Filtrar
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card>
                <Card.Header>
                  <h3 className="card-title mb-0 flex-grow-1">Repasse</h3>
                </Card.Header>

                <Card.Body>
                  <div>
                    <Card className="p-3">
                      <Row>
                        <Col md={4} className="text-align-center">
                          <h5>Convênio</h5>
                          <span>R$ 00,00</span>
                        </Col>
                        <Col md={4}>
                          <h5>Particular</h5>
                          <span>R$ 00,00</span>
                        </Col>
                        <Col md={4}>
                          <h5>Total</h5>
                          <span>R$ 00,00</span>
                        </Col>
                      </Row>
                    </Card>
                  </div>
                  <div>
                    <TableContainer
                      columns={columns}
                      data={dataTable}
                      customPageSize={10}
                      divClass="table-responsive mb-1"
                      tableClass="mb-0 align-middle table-borderless"
                      theadClass="table-light text-muted"
                      currentPage={1}
                      onChangePage={() => {}}
                      totalPages={1}
                      // onSortBy={() => {}}
                      // sortedBy={() => {}}
                      setCurrentPageSize={() => {}}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Repasse;

Repasse.getLayout = (page: any, logo: any) => (
  <Layout logo={logo}>{page}</Layout>
);
