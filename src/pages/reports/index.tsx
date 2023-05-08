import BreadCrumb from '@growth/growforce-admin-ui/components/Common/BreadCrumb';
import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Col } from '@growth/growforce-admin-ui/index';
import Head from 'next/head';
import QueryString from 'qs';
import { useState } from 'react';
import Flatpickr from 'react-flatpickr';
import { Button, Row } from 'reactstrap';
import { NextPageWithLayout } from '../../@types/next';
import Layout from '../../containers/Layout';
import { api } from '../../services/apiClient';
import { flatpickrPt } from '../../utils/flatpick-pt';
import { download } from '../../utils/multiDownload';
import { withSSRAuth } from '../../utils/withSSRAuth';

const routes = {
  'products-best-sellers': 'Relatório Financeiro',
  'sales-by-period': 'Relatório de itens',
  'performance-payment-method': 'Método de pagamento por desempenho',
  'average-ticket': 'Ticket Médio',
  'total-sales': 'Vendas Totais',
  'financial-report': 'Relatório Financeiro',
  'sales-report': 'Relatório de Vendas',
  'items-report': 'Relatório de itens',
  'logistic-report': 'Relatório Logístico',
};

const Reports: NextPageWithLayout = () => {
  const date = new Date();
  const [orderDate, setOrderDate] = useState<Date[]>([date]);
  const [type, setType] = useState('financial-report');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    const dateRelatoryName =
      (orderDate ? orderDate[0] : new Date()).toLocaleString()?.split(' ')[0] +
      '-' +
      (orderDate ? orderDate[1] : new Date()).toLocaleString()?.split(' ')[0];

    try {
      setIsDownloading(true);
      const { data } = await api.get(`reports/${type}`, {
        params: {
          dateStart: orderDate ? orderDate[0].toISOString().slice(0, 10) : date,
          dateEnd: orderDate ? orderDate[1].toISOString().slice(0, 10) : date,
        },
        paramsSerializer: (params) => {
          return QueryString.stringify(params);
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(data);
      await download(url, `${routes[type]} ${dateRelatoryName}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="page-content">
      <Head>
        <title>Download de relatórios - GrowForce</title>
      </Head>
      <BreadCrumb title="Relatório" pageTitle="Relatório" />
      <Card>
        <Card.Header className="d-flex align-items-center justify-content-between">
          <h5 className="mb-0">Download de relatórios</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col lg={3}>
              <select
                className="form-select"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                }}
              >
                {Object.keys(routes).map((key, index) => (
                  <option key={index} value={key}>
                    {routes[key]}
                  </option>
                ))}
              </select>
            </Col>
            <Col lg={3}>
              <div className="position-relative">
                <Flatpickr
                  placeholder="Selecione a data"
                  className="form-control"
                  id="orderDate"
                  options={{
                    mode: 'range',
                    dateFormat: 'd/m/Y',
                    locale: flatpickrPt,
                  }}
                  value={orderDate}
                  onChange={setOrderDate}
                  style={{
                    paddingRight: '30px',
                  }}
                />
                <Button
                  close
                  color="link"
                  className="shadow-none text-danger"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '10px',
                    transform: 'translateY(-50%)',
                  }}
                  onClick={() => setOrderDate(null)}
                />
              </div>
            </Col>
            <Col>
              <Button onClick={handleDownload}>
                {isDownloading ? 'Baixando...' : 'Baixar relatório'}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  return {
    props: {},
  };
});
export default Reports;

Reports.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
