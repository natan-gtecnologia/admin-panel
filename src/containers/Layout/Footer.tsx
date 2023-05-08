import { Col, Container, Row } from '@growth/growforce-admin-ui/index';

const Footer = () => {
  return (
    <footer className="footer">
      <Container fluid>
        <Row>
          <Col sm={6}>{new Date().getFullYear()} © Velzon.</Col>
          <Col sm={6}>
            <div className="text-sm-end d-none d-sm-block">
              Design & Develop by Themesbrand
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
