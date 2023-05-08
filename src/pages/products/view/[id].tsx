import { useState } from 'react';
import {
  Card,
  CardBody,
  Col,
  Container,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  Tooltip,
} from 'reactstrap';

//Simple bar

import BreadCrumb from '@growth/growforce-admin-ui/components/Common/BreadCrumb';

import classnames from 'clsx';

import Link from '@growth/growforce-admin-ui/components/Common/Link';
import { PricingWidgetList } from '@growth/growforce-admin-ui/components/Common/PricingWidgetList';
import Head from 'next/head';
import Image from 'next/image';
import SwiperCore, { FreeMode, Navigation, Thumbs } from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/effect-flip';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { Swiper, SwiperSlide } from 'swiper/react';

import { formatNumber, formatNumberToReal } from '@growth/core/util/formatting';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { NextPageWithLayout } from '../../../@types/next';
import { IProduct } from '../../../@types/product';
import { IStrapiProduct } from '../../../@types/strapi';
import Layout from '../../../containers/Layout';
import { setupAPIClient } from '../../../services/api';
import { convert_product_strapi } from '../../../utils/convertions/convert_product';
import { withSSRAuth } from '../../../utils/withSSRAuth';

SwiperCore.use([FreeMode, Navigation, Thumbs]);

type ProductProps = {
  product: IProduct;
};

const productTypes = {
  simple: 'Simples',
  grouped: 'Agrupados',
  kit: 'Kit',
};

const Create: NextPageWithLayout<ProductProps> = ({ product }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [ttop, setttop] = useState(false);
  const [customActiveTab, setcustomActiveTab] = useState('1');

  const toggleCustom = (tab: string) => {
    setcustomActiveTab((old) => (old !== tab ? tab : old));
  };

  return (
    <div className="page-content">
      <Head>
        <title>{product.title} - GrowForce</title>
      </Head>

      <Container fluid>
        <BreadCrumb title="Detalhes do produto" pageTitle="Ecommerce" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <Row className="gx-lg-5">
                  <Col xl={4} md={8} className="mx-auto">
                    <div className="product-img-slider sticky-side-div">
                      <Swiper
                        navigation={true}
                        thumbs={{ swiper: thumbsSwiper }}
                        className="swiper product-thumbnail-slider p-2 rounded bg-light"
                      >
                        {product.images.data &&
                          product.images.data.map((image) => (
                            <SwiperSlide key={`image-${image.id}`}>
                              <div className="nav-slide-item">
                                <img
                                  src={image?.attributes?.url}
                                  alt=""
                                  className="img-fluid d-block object-fit-contain"
                                  width={484}
                                  height={484}
                                />
                              </div>
                            </SwiperSlide>
                          ))}
                      </Swiper>

                      <div className="product-nav-slider mt-2">
                        <Swiper
                          onSwiper={setThumbsSwiper}
                          slidesPerView={4}
                          freeMode={true}
                          watchSlidesProgress={true}
                          spaceBetween={10}
                          className="swiper product-nav-slider mt-2 overflow-hidden"
                        >
                          <div className="swiper-wrapper">
                            {product.images.data &&
                              product.images.data.map((image) => (
                                <SwiperSlide key={image.id} className="rounded">
                                  <div className="nav-slide-item">
                                    <img
                                      src={image.attributes.formats?.thumbnail?.url}
                                      alt=""
                                      className="img-fluid d-block rounded"
                                      width={98}
                                      height={98}
                                    />
                                  </div>
                                </SwiperSlide>
                              ))}
                          </div>
                        </Swiper>
                      </div>
                    </div>
                  </Col>

                  <Col xl={8}>
                    <div className="mt-xl-0 mt-5">
                      <div className="d-flex">
                        <div className="flex-grow-1">
                          <h4>{product.title}</h4>
                          <div className="hstack gap-3 flex-wrap">
                            {product.sku && (
                              <>
                                <div className="text-muted">
                                  SKU:{' '}
                                  <span className="text-body fw-medium">
                                    {product.sku}
                                  </span>
                                </div>
                                <div className="vr"></div>
                              </>
                            )}
                            {product.publishedAt && (
                              <div className="text-muted">
                                Publicado:{' '}
                                <span className="text-body fw-medium">
                                  {format(
                                    new Date(product.publishedAt),
                                    'dd MMM, yyyy',
                                    {
                                      locale: ptBR,
                                    },
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div>
                            <Link
                              href={`/products/edit/${product.id}`}
                              id="edit-product-link"
                              className="btn btn-light"
                              aria-label="Editar produto"
                            >
                              <i className="ri-pencil-fill align-bottom"></i>
                            </Link>
                            <Tooltip
                              placement="top"
                              isOpen={ttop}
                              target="edit-product-link"
                              toggle={() => {
                                setttop(!ttop);
                              }}
                            >
                              Editar
                            </Tooltip>
                          </div>
                        </div>
                      </div>

                      <Row className="mt-4">
                        <Col lg={3} sm={6}>
                          <PricingWidgetList
                            pricingDetails={{
                              id: 1,
                              icon: 'ri-money-dollar-circle-fill',
                              label: 'Preço:',
                              labelDetail: formatNumberToReal(
                                product.price.salePrice,
                              ),
                            }}
                          />
                        </Col>

                        <Col lg={3} sm={6}>
                          <PricingWidgetList
                            pricingDetails={{
                              id: 2,
                              icon: 'ri-file-copy-2-fill',
                              label: 'N° de pedidos',
                              labelDetail: formatNumber(product.totalSales),
                            }}
                          />
                        </Col>

                        <Col lg={3} sm={6}>
                          <PricingWidgetList
                            pricingDetails={{
                              id: 3,
                              icon: 'ri-stack-fill',
                              label: 'Disponíveis em estoque',
                              labelDetail: formatNumber(product.stockQuantity),
                            }}
                          />
                        </Col>

                        <Col lg={3} sm={6}>
                          <PricingWidgetList
                            pricingDetails={{
                              id: 4,
                              icon: 'ri-inbox-archive-fill',
                              label: 'Rendimento total',
                              labelDetail: formatNumberToReal(
                                product.totalSales * product.price.salePrice,
                              ),
                            }}
                          />
                        </Col>
                      </Row>

                      <div className="mt-4 text-muted">
                        <h5 className="fs-14">Breve descrição:</h5>
                        <p>{product.shortDescription}</p>
                      </div>

                      <div className="mt-4 text-muted">
                        <h5 className="fs-14">Descrição completa:</h5>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: product.description,
                          }}
                        />
                      </div>

                      {product.groupType === 'grouped' && (
                        <Row className="mt-3">
                          <Col sm={6}>
                            <div>
                              <h5 className="fs-14">Itens no kit</h5>
                              <ul className="list-unstyled">
                                {product.groupedProducts
                                  .filter((gProduct) => gProduct.product.data)
                                  .map((gProduct, index) => (
                                    <li
                                      key={gProduct.product.data.id}
                                      className="py-1"
                                    >
                                      <i className="mdi mdi-circle-medium me-1 text-muted align-middle"></i>{' '}
                                      {gProduct.product.data.attributes.title}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          </Col>
                        </Row>
                      )}

                      <div className="product-content mt-5">
                        <h5 className="fs-14 mb-3">
                          Especificações do produto
                        </h5>
                        <Nav tabs className="nav-tabs-custom nav-success">
                          <NavItem>
                            <NavLink
                              style={{ cursor: 'pointer' }}
                              className={classnames({
                                active: customActiveTab === '1',
                              })}
                              onClick={() => {
                                toggleCustom('1');
                              }}
                            >
                              Informações gerais
                            </NavLink>
                          </NavItem>
                        </Nav>

                        <TabContent
                          activeTab={customActiveTab}
                          className="border border-top-0 p-4"
                          id="nav-tabContent"
                        >
                          <TabPane id="nav-speci" tabId="1">
                            <div className="table-responsive">
                              <table className="table mb-0">
                                <tbody>
                                  <tr>
                                    <th scope="row" style={{ width: '200px' }}>
                                      Produto em destaque
                                    </th>
                                    <td>{product.featured ? 'Sim' : 'Não'}</td>
                                  </tr>
                                  {product.categories.data.length > 0 && (
                                    <tr>
                                      <th scope="row">Categoria</th>
                                      <td>
                                        {product.categories.data
                                          .map((category, index) => {
                                            return category.attributes.title;
                                          })
                                          .join(', ')}
                                      </td>
                                    </tr>
                                  )}
                                  {product.brand.data && (
                                    <tr>
                                      <th scope="row">Marca</th>
                                      <td>
                                        {product.brand.data.attributes.name}
                                      </td>
                                    </tr>
                                  )}
                                  <tr>
                                    <th scope="row">Tipo de produto</th>
                                    <td>{productTypes[product.groupType]}</td>
                                  </tr>
                                  <tr>
                                    <th scope="row">Slug</th>
                                    <td>{product.slug}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </TabPane>

                          <TabPane id="nav-detail" tabId="2">
                            <div>
                              <h5 className="font-size-16 mb-3">
                                Tommy Hilfiger Sweatshirt for Men (Pink)
                              </h5>
                              <p>
                                Tommy Hilfiger men striped pink sweatshirt.
                                Crafted with cotton. Material composition is
                                100% organic cotton. This is one of the world’s
                                leading designer lifestyle brands and is
                                internationally recognized for celebrating the
                                essence of classic American cool style,
                                featuring preppy with a twist designs.
                              </p>
                              <div>
                                <p className="mb-2">
                                  <i className="mdi mdi-circle-medium me-1 text-muted align-middle"></i>{' '}
                                  Machine Wash
                                </p>
                                <p className="mb-2">
                                  <i className="mdi mdi-circle-medium me-1 text-muted align-middle"></i>{' '}
                                  Fit Type: Regular
                                </p>
                                <p className="mb-2">
                                  <i className="mdi mdi-circle-medium me-1 text-muted align-middle"></i>{' '}
                                  100% Cotton
                                </p>
                                <p className="mb-0">
                                  <i className="mdi mdi-circle-medium me-1 text-muted align-middle"></i>{' '}
                                  Long sleeve
                                </p>
                              </div>
                            </div>
                          </TabPane>

                          <TabPane id="nav-detail" tabId="3">
                            <div>
                              <h5 className="font-size-16 mb-3">
                                Tommy Hilfiger Sweatshirt for Men (Pink)
                              </h5>
                              <p>
                                Tommy Hilfiger men striped pink sweatshirt.
                                Crafted with cotton. Material composition is
                                100% organic cotton. This is one of the world’s
                                leading designer lifestyle brands and is
                                internationally recognized for celebrating the
                                essence of classic American cool style,
                                featuring preppy with a twist designs.
                              </p>
                              <div>
                                <p className="mb-2">
                                  <i className="mdi mdi-circle-medium me-1 text-muted align-middle"></i>{' '}
                                  Machine Wash
                                </p>
                                <p className="mb-2">
                                  <i className="mdi mdi-circle-medium me-1 text-muted align-middle"></i>{' '}
                                  Fit Type: Regular
                                </p>
                                <p className="mb-2">
                                  <i className="mdi mdi-circle-medium me-1 text-muted align-middle"></i>{' '}
                                  100% Cotton
                                </p>
                                <p className="mb-0">
                                  <i className="mdi mdi-circle-medium me-1 text-muted align-middle"></i>{' '}
                                  Long sleeve
                                </p>
                              </div>
                            </div>
                          </TabPane>
                        </TabContent>
                      </div>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  try {
    const apiClient = setupAPIClient(ctx);
    const id = ctx.params.id;

    const productRequest = await apiClient.get<{
      data: IStrapiProduct;
    }>(`/products/auth/${id}`);

    return {
      props: {
        product: convert_product_strapi(productRequest.data.data),
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: '/products',
        permanent: false,
      },
    };
  }
});

export default Create;

Create.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
