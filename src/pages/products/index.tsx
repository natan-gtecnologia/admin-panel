/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import BreadCrumb from '@growth/growforce-admin-ui/components/Common/BreadCrumb';
import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Tabs } from '@growth/growforce-admin-ui/components/Common/Tabs';

import TableContainer from '@growth/growforce-admin-ui/components/Common/TableContainer';
import {
  Button,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Modal,
  Row,
  UncontrolledCollapse,
  UncontrolledDropdown,
} from '@growth/growforce-admin-ui/index';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

import { NextPageWithLayout } from '../../@types/next';
import Layout from '../../containers/Layout';

import { useLayout } from '@growth/growforce-admin-ui/hooks/useLayout';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import debounce from 'lodash/debounce';
import { NextPageContext } from 'next';
import Head from 'next/head';
import 'nouislider/distribute/nouislider.css';
import qs from 'qs';
import { IBrand } from '../../@types/brand';
import { ICategory } from '../../@types/category';
import { IProduct } from '../../@types/product';
import { IStrapiProduct } from '../../@types/strapi';
import { setupAPIClient } from '../../services/api';
import { api } from '../../services/apiClient';
import { queryClient } from '../../services/react-query';
import { convert_brand_strapi } from '../../utils/convertions/convert_brand';
import { convert_category_strapi } from '../../utils/convertions/convert_category';
import { convert_product_strapi } from '../../utils/convertions/convert_product';
import { withSSRAuth } from '../../utils/withSSRAuth';

/**
 * ProductsProps is an object with two properties, products and totalPages.
 *
 * products is an array of IProduct objects.
 *
 * totalPages is a number.
 * @property {IProduct[]} products - This is an array of products that we will be
 * displaying.
 * @property {number} totalPages - The total number of pages that the products are
 * spread across.
 */
type ProductsProps = {
  products: IProduct[];
  totalPages: number;

  categories: ICategory[];
  brands: IBrand[];
  totalBrands: number;
};

/**
 * CellProps is an object with a row property that is an object with an original
 * property that is an IProduct.
 * @property row - This is the entire row of data.
 */
type CellProps = {
  row: {
    original: IProduct;
  };
};

/**
 * It fetches a list of products from the Strapi API, and converts them to a format
 * that's easier to work with in the frontend
 * @param params - This is an object with pagination and other parameters that we
 * can use to filter the products.
 */
async function getProducts(
  ctx: Pick<NextPageContext, 'req'>,
  params: Record<string, any>,
) {
  const api = setupAPIClient(ctx);
  const products = await api.get<{
    meta: {
      pageCount: number;
    };
    data: IStrapiProduct[];
  }>('/products', {
    params: {
      populate: '*',
      pagination: {
        pageSize: 10,
        ...params.pagination,
      },
      ...params,
    },
    paramsSerializer: (params) => {
      return qs.stringify(params);
    },
  });
  return {
    products: products.data.data.map(convert_product_strapi),
    totalPages: products.data.meta.pageCount,
  };
}

const stockStatuses = {
  in_stock: 'Em estoque',
  out_of_stock: 'Fora de estoque',
  low_stock: 'Estoque baixo',
  on_back_order: 'Em espera',
};

const Products: NextPageWithLayout<ProductsProps> = ({
  products: initialProducts,
  totalPages: initialTotalPages,

  brands: initialBrands,
  categories,
  totalBrands,
}) => {
  const { handleChangeLoading } = useLayout();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  //const [minCost, setMinCost] = useState(0);
  //const [maxCost, setMaxCost] = useState(2000);
  //const [ratingvalues, setRatingvalues] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [sortedBy, setSortedBy] = useState('');
  const [publicationState, setPublicationState] = useState('preview');
  const {
    data: { products, totalPages },
    refetch: handleRefetchProducts,
  } = useQuery(
    [
      'products',
      currentPage,
      sortedBy,
      selectedCategory,
      selectedBrands,
      publicationState,
      currentPageSize
      //search,
    ],
    async () => {
      handleChangeLoading({
        description: 'Carregando produtos',
        title: 'Carregando',
      });
      const state = publicationState === 'draft' ? 'preview' : publicationState;
      const response = await getProducts(undefined, {
        publicationState: state,
        pagination: {
          pageSize: currentPageSize,
          page: currentPage,
        },
        ...(sortedBy && {
          sort: sortedBy,
        }),
        filters: {
          ...(selectedCategory && {
            categories: {
              id: {
                $eq: selectedCategory,
              },
            },
          }),
          ...(publicationState === 'draft' && {
            publishedAt: {
              $null: true,
            },
          }),
          ...(selectedBrands && {
            brand: {
              $or: selectedBrands.map((id) => ({
                id: {
                  $eq: id,
                },
              })),
            },
          }),
          ...(search && {
            title: {
              $containsi: search,
            },
          }),
        },
      });

      handleChangeLoading(null);

      return {
        products: response.products,
        totalPages: response.totalPages,
      };
    },
    {
      initialData: {
        products: initialProducts,
        totalPages: initialTotalPages,
      },
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    },
  );

  const [brands, setBrands] = useState(initialBrands);
  const [searchBrand, setSearchBrand] = useState('');
  const [deleteProduct, setDeleteProduct] = useState<IProduct | null>(null);

  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => {
      return brand.name.toLowerCase().includes(searchBrand.toLowerCase());
    });
  }, [brands, searchBrand]);

  const handleChangeCategories = async (category: number | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const onClearFilters = async () => {
    setSelectedCategory(null);
    setCurrentPage(1);
    setSortedBy('');
    setSelectedBrands([]);
    setSearch('');
  };

  const handleChangePage = useCallback(async (page: number) => {
    setCurrentPage(page);
  }, []);

  const handleStartDeleteProduct = useCallback((product: IProduct) => {
    setDeleteProduct(product);
  }, []);

  const handleDeleteProduct = useCallback(
    async (product_id: number) => {
      try {
        await api.delete(`/products/${product_id}`);

        await handleRefetchProducts();

        setDeleteProduct(null);

        queryClient.setQueriesData<{
          products: IProduct[];
          totalPages: number;
        }>(
          [
            'products',
            currentPage,
            sortedBy,
            selectedCategory,
            selectedBrands,
            publicationState,
            //search,
          ],
          (oldData) => {
            return {
              ...oldData,
              products: oldData.products.filter(
                (product) => product.id !== product_id,
              ),
            };
          },
        );
      } catch {
        console.log('err');
      }
    },
    [
      currentPage,
      handleRefetchProducts,
      publicationState,
      selectedBrands,
      selectedCategory,
      sortedBy,
    ],
  );

  const _onSearch = useCallback(
    async (value: string) => {
      setCurrentPage(1);

      await handleRefetchProducts();
    },
    [handleRefetchProducts],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce(_onSearch, 500), []);

  const columns = useMemo(
    () => [
      {
        Header: 'Produto',
        Cell: (product: CellProps) => (
          <>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="avatar-sm bg-light rounded p-1">
                  {product.row.original.images?.data?.length > 0 && (
                    <img
                      src={product.row.original.images.data[0].attributes.url}
                      alt=""
                      className="img-fluid d-block"
                    />
                  )}
                </div>
              </div>
              <div
                className="flex-grow-1"
                style={{
                  maxWidth: 165,
                }}
              >
                <h5 className="fs-14 mb-1">
                  <Link
                    href={`/products/view/${product.row.original.id}`}
                    className="text-dark"
                  >
                    {product.row.original.title}
                  </Link>
                </h5>
                <p className="text-muted mb-0">
                  Category :{' '}
                  <span className="fw-medium">
                    {' '}
                    {product.row.original.categories.data.length > 0
                      ? product.row.original.categories.data[0].attributes.title
                      : 'Não informado'}
                  </span>
                </p>
              </div>
            </div>
          </>
        ),
      },
      {
        Header: 'Marca',
        accessor: 'brand.id',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          return (
            <span className="d-block text-center">
              {cellProps.row.original.brand?.data?.attributes?.name ||
                'Não informado'}
            </span>
          );
        },
      },
      {
        Header: 'Slug',
        accessor: 'slug',
        filterable: false,
        Cell: (cellProps) => {
          return (
            <span
              className="d-block text-center"
              style={{
                maxWidth: 170,
              }}
            >
              {cellProps.row.original.slug}
            </span>
          );
        },
      },
      {
        Header: 'Estoque',
        accessor: 'stockQuantity',
        filterable: false,
        Cell: (cellProps) => {
          return (
            <span className="d-block text-center">
              {cellProps.row.original.stockQuantity}
            </span>
          );
        },
      },
      {
        Header: 'Status do estoque',
        accessor: 'stockStatus',
        filterable: false,
        Cell: (cellProps) => {
          return (
            <span className="d-block text-center">
              {stockStatuses[cellProps.row.original.stockStatus]}
            </span>
          );
        },
      },
      {
        Header: 'Status',
        accessor: 'publishedAt',
        filterable: false,
        Cell: (cellProps) => {
          return (
            <span
              className={clsx('badge align-middle rounded text-uppercase', {
                'badge-soft-success': cellProps.row.original.publishedAt,
                'badge-soft-danger': !cellProps.row.original.publishedAt,
              })}
            >
              {cellProps.row.original.publishedAt ? 'Publicado' : 'Rascunho'}
            </span>
          );
        },
      },
      {
        Header: 'Ações',
        Cell: (cellProps) => {
          return (
            <UncontrolledDropdown>
              <DropdownToggle
                href="#"
                className="btn-soft-secondary btn-sm"
                tag="button"
              >
                <i className="ri-more-fill" />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <Link
                  href={`/products/view/${cellProps.row.original.id}`}
                  passHref
                  tabIndex={0}
                  role="menuitem"
                  className="dropdown-item"
                >
                  <i className="ri-eye-fill align-bottom me-2 text-muted"></i>{' '}
                  View
                </Link>

                <Link
                  passHref
                  tabIndex={0}
                  role="menuitem"
                  className="dropdown-item"
                  href={`/products/edit/${cellProps.row.original.id}`}
                >
                  <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{' '}
                  Edit
                </Link>

                <DropdownItem divider />
                <DropdownItem
                  onClick={() => {
                    const productData = cellProps.row.original;
                    handleStartDeleteProduct(productData);
                  }}
                >
                  <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{' '}
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          );
        },
      },
    ],
    [handleStartDeleteProduct],
  );

  const handleToggleBrand = useCallback(async (brand_id: number) => {
    setSelectedBrands((oldBrands) => {
      if (oldBrands.includes(brand_id)) {
        return oldBrands.filter((id) => id !== brand_id);
      }

      return [...oldBrands, brand_id];
    });
  }, []);

  const handleSortBy = useCallback(
    async (sortBy: string, order: 'desc' | 'asc') => {
      setSortedBy((old) => {
        if (old === `${sortBy}:asc`) {
          return `${sortBy}:desc`;
        }

        return `${sortBy}:${order}`;
      });
      setCurrentPage(1);
    },
    [],
  );

  const orderBy = useMemo(() => {
    const [id, desc] = sortedBy.split(':');

    return [
      {
        id,
        desc: desc === 'desc',
      },
    ];
  }, [sortedBy]);

  const handleGetByStatus = useCallback(async (status: string) => {
    setPublicationState(status);
    setCurrentPage(1);
    setSortedBy('');
  }, []);

  const handleLoadMoreBrands = useCallback(async () => {
    const brandsPage = Math.ceil(brands.length / 100);
    const totalBrandsPages = Math.ceil(totalBrands / 100);

    if (brandsPage >= totalBrandsPages) {
      return;
    }

    const response = await api.get('/brands', {
      params: {
        populate: '*',
        publicationState: 'preview',
        pagination: {
          page: brandsPage + 1,
          pageSize: 100,
        },
      },
      paramsSerializer: (params) => {
        return qs.stringify(params);
      },
    });

    const data = response.data.data.map(convert_brand_strapi) || [];

    setBrands((oldBrands) => [...oldBrands, ...data]);
  }, [brands.length, totalBrands]);

  return (
    <div className="page-content">
      <Head>
        <title>Produtos - GrowForce</title>
      </Head>
      <BreadCrumb title="Produtos" pageTitle="Ecommerce" />

      <Row>
        <Col lg={4}>
          <Card>
            <Card.Header>
              <div className="d-flex">
                <div className="flex-grow-1">
                  <h5 className="fs-16 m-0">Filters</h5>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={onClearFilters}
                    className="btn btn-link shadow-none p-0 text-decoration-underline"
                  >
                    Limpar tudo
                  </button>
                </div>
              </div>
            </Card.Header>
            <div className="accordion accordion-flush">
              <div className="card-body border-bottom">
                <div>
                  <p className="text-muted text-uppercase fs-12 fw-medium mb-2">
                    PRODUTOS
                  </p>
                  <ul className="list-unstyled mb-0 filter-list d-flex flex-column gap-1">
                    {categories.map((category) => (
                      <li key={`category-${category.id}`}>
                        <Button
                          color="link"
                          className={clsx(
                            'd-flex py-1 align-items-center shadow-none p-0',
                            {
                              'text-decoration-none':
                                selectedCategory !== category.id,
                              'text-primary': selectedCategory === category.id,
                            },
                          )}
                          onClick={() =>
                            handleChangeCategories(
                              selectedCategory === category.id
                                ? null
                                : category.id,
                            )
                          }
                        >
                          <div className="flex-grow-1">
                            <h5 className="fs-13 mb-0 listname">
                              {category.title}
                            </h5>
                          </div>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/*<div className="card-body border-bottom">
                <p className="text-muted text-uppercase fs-12 fw-medium mb-4">
                  PREÇO
                </p>

                <Nouislider
                  range={{ min: 0, max: 2000 }}
                  start={[minCost, maxCost]}
                  connect
                  onEnd={onUpdate}
                  data-slider-color="success"
                  id="product-price-range"
                />
                <div className="formCost d-flex gap-2 align-items-center mt-3">
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    id="minCost"
                    value={formatNumberToReal(minCost)}
                    readOnly
                  />
                  <span className="fw-semibold text-muted">to</span>
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    id="maxCost"
                    value={formatNumberToReal(maxCost)}
                    readOnly
                  />
                </div>
              </div>*/}

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button bg-transparent shadow-none"
                    type="button"
                    id="flush-headingBrands"
                  >
                    <span className="text-muted text-uppercase fs-12 fw-medium">
                      Marcas
                    </span>{' '}
                    <span className="badge bg-success rounded-pill align-middle ms-1">
                      {selectedBrands.length}
                    </span>
                  </button>
                </h2>
                <UncontrolledCollapse
                  toggler="#flush-headingBrands"
                  defaultOpen
                >
                  <div
                    id="flush-collapseBrands"
                    className="accordion-collapse collapse show"
                    aria-labelledby="flush-headingBrands"
                  >
                    <div className="accordion-body text-body pt-0">
                      <div className="search-box search-box-sm">
                        <input
                          type="text"
                          className="form-control bg-light border-0"
                          placeholder="Search Brands..."
                          onChange={(e) => setSearchBrand(e.target.value)}
                          value={searchBrand}
                        />
                        <i className="ri-search-line search-icon"></i>
                      </div>

                      <div className="d-flex flex-column gap-2 mt-3">
                        {filteredBrands.map((brand) => (
                          <div key={`brand-${brand.id}`} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="productBrandRadio5"
                              value={brand.id}
                              checked={selectedBrands.includes(brand.id)}
                              onChange={() => handleToggleBrand(brand.id)}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="productBrandRadio5"
                            >
                              {brand.name}
                            </label>
                          </div>
                        ))}

                        {totalBrands - brands.length > 0 && (
                          <div>
                            <button
                              onClick={handleLoadMoreBrands}
                              type="button"
                              className="btn btn-link shadow-none text-decoration-none text-uppercase fw-medium p-0"
                            >
                              {totalBrands - brands.length} More
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </UncontrolledCollapse>
              </div>

              {/*<div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button bg-transparent shadow-none collapsed"
                    type="button"
                    id="flush-headingDiscount"
                  >
                    <span className="text-muted text-uppercase fs-12 fw-medium">
                      DESCONTOS
                    </span>{' '}
                    <span className="badge bg-success rounded-pill align-middle ms-1">
                      1
                    </span>
                  </button>
                </h2>
                <UncontrolledCollapse toggler="#flush-headingDiscount">
                  <div
                    id="flush-collapseDiscount"
                    className="accordion-collapse collapse show"
                  >
                    <div className="accordion-body text-body pt-1">
                      <div className="d-flex flex-column gap-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="productdiscountRadio6"
                          />
                          <label
                            className="form-check-label"
                            htmlFor="productdiscountRadio6"
                          >
                            50% or more
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="productdiscountRadio5"
                          />
                          <label
                            className="form-check-label"
                            htmlFor="productdiscountRadio5"
                          >
                            40% or more
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="productdiscountRadio4"
                          />
                          <label
                            className="form-check-label"
                            htmlFor="productdiscountRadio4"
                          >
                            30% or more
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="productdiscountRadio3"
                          />
                          <label
                            className="form-check-label"
                            htmlFor="productdiscountRadio3"
                          >
                            20% or more
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="productdiscountRadio2"
                          />
                          <label
                            className="form-check-label"
                            htmlFor="productdiscountRadio2"
                          >
                            10% or more
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="productdiscountRadio1"
                          />
                          <label
                            className="form-check-label"
                            htmlFor="productdiscountRadio1"
                          >
                            Less than 10%
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </UncontrolledCollapse>
              </div>*/}

              {/*<div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button bg-transparent shadow-none collapsed"
                    type="button"
                    id="flush-headingRating"
                  >
                    <span className="text-muted text-uppercase fs-12 fw-medium">
                      AVALIAÇÕES
                    </span>{' '}
                    <span className="badge bg-success rounded-pill align-middle ms-1">
                      1
                    </span>
                  </button>
                </h2>

                <UncontrolledCollapse toggler="#flush-headingRating">
                  <div
                    id="flush-collapseRating"
                    className="accordion-collapse collapse show"
                    aria-labelledby="flush-headingRating"
                  >
                    <div className="accordion-body text-body">
                      <div className="d-flex flex-column gap-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="productratingRadio4"
                            onChange={(e) => {
                              if (e.target.checked) {
                                onChangeRating(4);
                              } else {
                                onUncheckMark(4);
                              }
                            }}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="productratingRadio4"
                          >
                            <span className="text-muted">
                              <i className="mdi mdi-star text-warning"></i>
                              <i className="mdi mdi-star text-warning"></i>
                              <i className="mdi mdi-star text-warning"></i>
                              <i className="mdi mdi-star text-warning"></i>
                              <i className="mdi mdi-star"></i>
                            </span>{' '}
                            4 & Above
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="productratingRadio3"
                            onChange={(e) => {
                              if (e.target.checked) {
                                onChangeRating(3);
                              } else {
                                onUncheckMark(3);
                              }
                            }}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="productratingRadio3"
                          >
                            <span className="text-muted">
                              <i className="mdi mdi-star text-warning"></i>
                              <i className="mdi mdi-star text-warning"></i>
                              <i className="mdi mdi-star text-warning"></i>
                              <i className="mdi mdi-star"></i>
                              <i className="mdi mdi-star"></i>
                            </span>{' '}
                            3 & Above
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="productratingRadio2"
                            onChange={(e) => {
                              if (e.currentTarget.checked) {
                                onChangeRating(2);
                              } else {
                                onUncheckMark(2);
                              }
                            }}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="productratingRadio2"
                          >
                            <span className="text-muted">
                              <i className="mdi mdi-star text-warning"></i>
                              <i className="mdi mdi-star text-warning"></i>
                              <i className="mdi mdi-star"></i>
                              <i className="mdi mdi-star"></i>
                              <i className="mdi mdi-star"></i>
                            </span>{' '}
                            2 & Above
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="productratingRadio1"
                            onChange={(e) => {
                              if (e.target.checked) {
                                onChangeRating(1);
                              } else {
                                onUncheckMark(1);
                              }
                            }}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="productratingRadio1"
                          >
                            <span className="text-muted">
                              <i className="mdi mdi-star text-warning"></i>
                              <i className="mdi mdi-star"></i>
                              <i className="mdi mdi-star"></i>
                              <i className="mdi mdi-star"></i>
                              <i className="mdi mdi-star"></i>
                            </span>{' '}
                            1
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </UncontrolledCollapse>
              </div>*/}
            </div>
          </Card>
        </Col>

        <Col lg={8}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <Link
                  href="/products/create"
                  className="btn btn-success d-flex align-items-center gap-2 justify-content-center"
                  style={{
                    background: '#0AB39C',
                  }}
                >
                  <i className="bx bx-plus"></i>
                  Adicionar produto
                </Link>

                <div
                  className="input-group shadow-none border border-light border-3 bg-transparent"
                  style={{
                    maxWidth: 215,
                  }}
                >
                  <span
                    className="input-group-text bg-transparent border-0 ps-2 pe-1"
                    id="basic-addon1"
                  >
                    <i className="mdi mdi-magnify"></i>
                  </span>
                  <Input
                    type="text"
                    className="form-control ps-2 border-0"
                    placeholder="Busque..."
                    aria-label="Buscar"
                    aria-describedby="basic-addon1"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      debouncedSearch(e.target.value);
                    }}
                  />
                </div>
              </div>

              <div>
                <div
                  style={{
                    height: 40,
                  }}
                >
                  <Tabs
                    dataTabs={[
                      {
                        title: (
                          <>
                            Todos{' '}
                            {/*<span className="badge badge-soft-danger align-middle rounded-pill ms-1">
                              12
                            </span>*/}
                          </>
                        ),
                        content: <span />,
                        id: 'preview',
                      },
                      {
                        title: (
                          <>
                            Publicados{' '}
                            {/*<span className="badge badge-soft-danger align-middle rounded-pill ms-1">
                              12
                            </span>*/}
                          </>
                        ),
                        content: <span />,
                        id: 'live',
                      },
                      {
                        title: (
                          <>
                            Rascunhos{' '}
                            {/*<span className="badge badge-soft-danger align-middle rounded-pill ms-1">
                              12
                            </span>*/}
                          </>
                        ),
                        content: <span />,
                        id: 'draft',
                      },
                    ]}
                    tabs
                    className="nav-tabs-custom card-header-tabs border-bottom-0 nav"
                    onTabChange={handleGetByStatus}
                  />
                </div>

                <TableContainer
                  columns={columns}
                  data={products || []}
                  customPageSize={10}
                  divClass="table-responsive mb-1"
                  tableClass="mb-0 align-middle table-borderless"
                  theadClass="table-light text-muted"
                  onSortBy={handleSortBy}
                  sortedBy={orderBy}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onChangePage={handleChangePage}
                  setCurrentPageSize={setCurrentPageSize}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {deleteProduct && (
        <Modal
          isOpen={!!deleteProduct}
          centered
          toggle={() => setDeleteProduct(null)}
        >
          <Card className="m-0">
            <Card.Header className="d-flex align-items-center gap-1 justify-content-between">
              <h4 className="m-0 fs-5">Tem certeza?</h4>
              <Button onClick={() => setDeleteProduct(null)} close />
            </Card.Header>
            <Card.Body>
              <p className="m-0">
                Tem certeza que deseja excluir este registro? Esta ação não pode
                ser desfeita.
              </p>
            </Card.Body>

            <Card.Footer className="d-flex align-items-center gap-2 justify-content-end">
              <Button onClick={() => setDeleteProduct(null)} color="light">
                Cancelar
              </Button>
              <Button
                color="danger"
                onClick={() => handleDeleteProduct(deleteProduct.id)}
              >
                Confirmar
              </Button>
            </Card.Footer>
          </Card>
        </Modal>
      )}
    </div>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);

  const productsRequest = apiClient.get<{
    meta: {
      pageCount: number;
    };
    data: IStrapiProduct[];
  }>('/products', {
    params: {
      populate: '*',
      publicationState: 'preview',
      pagination: {
        pageSize: 10,
      },
    },
    paramsSerializer: (params) => {
      return qs.stringify(params);
    },
  });

  const categoriesRequest = apiClient.get('/categories', {
    params: {
      populate: '*',
      publicationState: 'preview',
      pagination: {
        pageSize: 100,
      },
    },
    paramsSerializer: (params) => {
      return qs.stringify(params);
    },
  });
  const brandsRequest = apiClient.get('/brands', {
    params: {
      populate: '*',
      publicationState: 'preview',
      pagination: {
        pageSize: 100,
      },
    },
    paramsSerializer: (params) => {
      return qs.stringify(params);
    },
  });

  const [productsResponse, categoriesResponse, brandsResponse] =
    await Promise.all([productsRequest, categoriesRequest, brandsRequest]);

  return {
    props: {
      products: productsResponse.data.data.map(convert_product_strapi),
      totalPages: productsResponse.data.meta.pageCount,
      categories:
        categoriesResponse.data.data.map(convert_category_strapi) || [],
      brands: brandsResponse.data.data.map(convert_brand_strapi) || [],

      totalBrands: brandsResponse.data.meta.pagination.total,
    },
  };
});

export default Products;

Products.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
