/* eslint-disable @typescript-eslint/no-explicit-any */
import BreadCrumb from '@growth/growforce-admin-ui/components/Common/BreadCrumb';
import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import Loader from '@growth/growforce-admin-ui/components/Common/Loader';
import TableContainer from '@growth/growforce-admin-ui/components/Common/TableContainer';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { Button } from 'reactstrap';
import { NextPageWithLayout } from '../../@types/next';
import Layout from '../../containers/Layout';

import { useLayout } from '@growth/growforce-admin-ui/hooks/useLayout';
import { Col, Row } from '@growth/growforce-admin-ui/index';
import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { NextPageContext } from 'next';
import Head from 'next/head';
import QueryString from 'qs';
import { ICategory } from '../../@types/category';
import { IStrapiCategory } from '../../@types/strapi';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { setupAPIClient } from '../../services/api';
import { api } from '../../services/apiClient';
import { queryClient } from '../../services/react-query';
import { convert_category_strapi } from '../../utils/convertions/convert_category';
import { withSSRAuth } from '../../utils/withSSRAuth';
import clsx from 'clsx';

/**
 * TagsProps is an object with three properties: tags, total, and totalPages. tags
 * is an array of ITag objects, total is a number, and totalPages is a number.
 * @property {ICategory[]} categories - An array of ITag objects.
 * @property {number} total - The total number of tags in the database.
 * @property {number} totalPages - The total number of pages.
 */
type CategoriesProps = {
  categories: ICategory[];
  totalPages: number;
};

/**
 * CellProps is an object with a row property that is an object with an original
 * property that is an ITag.
 * @property row - The row object that contains the data for the current row.
 */
type CellProps = {
  row: {
    original: ICategory;
  };
};

/**
 * It fetches a list of tags from the Strapi API, and converts them to a format
 * that's easier to work with in the frontend
 * @param params - Record<string, any> - The parameters to be passed to the API
 */
async function getCategories(
  ctx: Pick<NextPageContext, 'req'>,
  params: Record<string, any>,
) {
  const apiClient = setupAPIClient(ctx);

  const categories = await apiClient.get<{
    meta: {
      pagination: {
        total: number;
        pageCount: number;
      };
    };
    data: IStrapiCategory[];
  }>('/categories', {
    params: {
      populate: '*',
      pagination: {
        pageSize: 10,
        ...params.pagination,
      },
      publicationState: 'preview',
      ...params,
    },
    paramsSerializer: (params) => {
      return QueryString.stringify(params);
    },
  });
  return {
    categories: categories.data.data.map(convert_category_strapi),
    totalPages: categories.data.meta.pagination.pageCount,
  };
}

const Categories: NextPageWithLayout<CategoriesProps> = ({
  categories: initialCategories,
  totalPages: initialTotalPages,
}) => {
  const { handleChangeLoading } = useLayout();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sortedBy, setSortedBy] = useState('');
  const {
    data: { categories, totalPages },
    refetch: refetchCategories,
    isFetching,
  } = useQuery(
    ['categories', currentPage, sortedBy, currentPageSize],
    async () => {
      const response = await getCategories(undefined, {
        pagination: {
          pageSize: currentPageSize,
          page: currentPage,
        },
        ...(sortedBy && {
          sort: sortedBy,
        }),
        filters: {
          ...(search && {
            $or: [
              {
                title: {
                  $containsi: search,
                },
              },
            ],
          }),
        },
      });

      return {
        categories: response.categories,
        totalPages: response.totalPages,
      };
    },
    {
      initialData: {
        categories: initialCategories,
        totalPages: initialTotalPages,
      },
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    },
  );

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  /**
   * It takes a search string, and then calls the getTags function from the API,
   * passing in the search string as a filter
   * @param {string} search - string - The search string
   */
  const handleSearch = useCallback(
    async (search: string) => {
      try {
        setSearch(search);
        setCurrentPage(1);

        refetchCategories();
      } catch (e) {
        console.log(e);
      }
    },
    [refetchCategories],
  );

  /* A callback function that is called when the page is changed. */
  const handleChangePage = useCallback(async (page: number) => {
    setCurrentPage(page);
  }, []);

  /**
   * It's a function that deletes a tag from the database, and then refreshes the
   * page
   * @param {number} id - number - The id of the tag to be deleted
   */
  const handleDeleteCategory = useCallback(
    async (id: number) => {
      handleChangeLoading({
        description: 'Excluindo categorias selecionadas',
        title: 'Excluindo categorias',
      });
      try {
        await api.delete(`/categories/${id}`);

        queryClient.setQueryData<{
          categories: ICategory[];
          totalPages: number;
        }>(['categories', currentPage, sortedBy], (oldData) => {
          return {
            ...oldData,
            categories: oldData?.categories.filter(
              (category) => category.id !== id,
            ),
          };
        });
      } finally {
        handleChangeLoading(null);
      }
    },
    [currentPage, handleChangeLoading, sortedBy],
  );

  const handleSortBy = useCallback(
    async (sortBy: string, order: 'desc' | 'asc') => {
      setCurrentPage(1);
      setSortedBy(`${sortBy}:${order}`);
    },
    [],
  );

  const checkedAll = useCallback(() => {
    setSelectedCategories((oldValues) => {
      if (oldValues.length === categories.length) {
        return [];
      } else {
        return categories.map((coupon) => coupon.id);
      }
    });
  }, [categories]);

  const columns = useMemo(
    () => [
      {
        Header: (
          <input
            type="checkbox"
            id="checkBoxAll"
            className="form-check-input"
            onChange={checkedAll}
            checked={
              selectedCategories.length === categories.length &&
              selectedCategories.length > 0
            }
          />
        ),
        Cell: (cellProps: CellProps) => {
          return (
            <input
              type="checkbox"
              className="customerCheckBox form-check-input"
              value={cellProps.row.original.id}
              checked={selectedCategories.includes(cellProps.row.original.id)}
              onChange={(e) => {
                setSelectedCategories((oldValues) => {
                  if (oldValues.includes(cellProps.row.original.id)) {
                    return oldValues.filter(
                      (value) => value !== cellProps.row.original.id,
                    );
                  }

                  return [...oldValues, cellProps.row.original.id];
                });
              }}
            />
          );
        },
        id: '#',
      },
      {
        Header: 'ID',
        accessor: 'id',
        filterable: false,
        Cell: (cellProps: CellProps) => (
          <span>{cellProps.row.original.id}</span>
        ),
      },
      {
        Header: 'TÍTULO',
        accessor: 'title',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          return (
            <span className="d-block">{cellProps.row.original.title}</span>
          );
        },
      },
      {
        Header: 'DESCRIÇÃO',
        accessor: 'description',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          return (
            <span className="d-flex align-items-center gap-1">
              {cellProps.row.original.description ?? '--'}
            </span>
          );
        },
      },
      {
        Header: 'SLUG',
        accessor: 'slug',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          return <span className="d-block">{cellProps.row.original.slug}</span>;
        },
      },
      {
        Header: 'Status',
        accessor: 'publishedAt',
        filterable: false,
        Cell: (cellProps: CellProps) => {
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
        canSort: false,
        Cell: (cellProps: CellProps) => {
          return (
            <div className="d-flex gap-3">
              <div className="edit d-flex align-items-center">
                <Link
                  href={`/categories/edit/${cellProps.row.original.id}`}
                  className="cursor-pointer"
                  aria-label="Editar tag"
                >
                  <i className="ri-pencil-fill"></i>
                </Link>
              </div>
              <div className="delete">
                <ConfirmationModal
                  changeStatus={() =>
                    handleDeleteCategory(cellProps.row.original.id)
                  }
                  title="Tem certeza?"
                  message="Você tem certeza que deseja excluir a categoria? Essa ação não pode ser desfeita."
                >
                  <button
                    className="btn btn-link shadow-none p-0 text-danger fs-5 text-decoration-none cursor-pointer"
                    aria-label="Deletar categoria"
                  >
                    <i className="ri-delete-bin-line" color="success"></i>
                  </button>
                </ConfirmationModal>
              </div>
            </div>
          );
        },
      },
    ],
    [categories.length, checkedAll, handleDeleteCategory, selectedCategories],
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

  /* It's a function that takes a search string, and then calls the getTags
  function from the API, passing in the search string as a filter */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce(handleSearch, 500), []);

  const handleDeleteCategories = async () => {
    handleChangeLoading({
      description: 'Excluindo categorias selecionadas',
      title: 'Excluindo categorias',
    });

    try {
      await Promise.all(
        selectedCategories.map((id) => api.delete(`/categories/${id}`)),
      );
      setSelectedCategories([]);

      queryClient.setQueryData<{ categories: ICategory[]; totalPages: number }>(
        ['categories', currentPage, sortedBy],
        (oldData) => {
          return {
            ...oldData,
            categories: oldData?.categories.filter(
              (category) => !selectedCategories.includes(category.id),
            ),
          };
        },
      );
    } finally {
      handleChangeLoading(null);
    }
  };

  return (
    <div className="page-content">
      <Head>
        <title>Categorias - GrowForce</title>
      </Head>
      <BreadCrumb title="Categorias" pageTitle="Ecommerce" />

      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header className="card-header">
              <div className="d-flex align-items-center">
                <h5 className="card-title mb-0 flex-grow-1">Categorias</h5>
                <div className="flex-shrink-0">
                  <Link
                    href={'/categories/create'}
                    className="btn shadow-none btn-success"
                  >
                    <i className="ri-add-line align-bottom me-1"></i>
                    Adicionar nova categoria
                  </Link>{' '}
                  {selectedCategories.length > 0 && (
                    <ConfirmationModal
                      changeStatus={handleDeleteCategories}
                      title="Tem certeza?"
                      message="Você tem certeza que deseja excluir as categorias selecionadas? Essa ação não pode ser desfeita."
                    >
                      <button
                        type="button"
                        className="btn shadow-none btn-soft-danger bg"
                      >
                        <i className="ri-delete-bin-line align-bottom"></i>
                      </button>
                    </ConfirmationModal>
                  )}
                </div>
              </div>
            </Card.Header>

            <Card.Body>
              <div id="customerList">
                <Row className="mb-4">
                  <Col>
                    <div>
                      <div className="search-box ms-2">
                        <input
                          type="text"
                          className="form-control search"
                          placeholder="Pesquise..."
                          value={search}
                          onChange={(e) => {
                            setSearch(e.target.value);
                            debouncedSearch(e.target.value);
                          }}
                        />
                        <i className="ri-search-line search-icon"></i>
                      </div>
                    </div>
                  </Col>

                  <Col
                    style={{
                      maxWidth: 'calc(calc(var(--vz-gutter-x) * 0.5) + 102px)',
                    }}
                  >
                    <Button
                      color="info"
                      className="shadow-none"
                      style={{
                        width: '100%',
                        opacity: 1,
                      }}
                      disabled
                    >
                      <i className=" ri-equalizer-fill align-bottom me-2"></i>
                      Filtros
                    </Button>
                  </Col>
                </Row>
              </div>

              <div>
                <TableContainer
                  columns={columns}
                  data={categories}
                  customPageSize={10}
                  divClass="table-responsive mb-1"
                  tableClass="mb-0 align-middle table-borderless"
                  theadClass="table-light text-muted"
                  currentPage={currentPage}
                  onChangePage={handleChangePage}
                  totalPages={totalPages}
                  onSortBy={handleSortBy}
                  sortedBy={orderBy}
                  setCurrentPageSize={setCurrentPageSize}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {isFetching && <Loader loading={null} />}
    </div>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);
  const categories = await apiClient.get<{
    meta: {
      pagination: {
        total: number;
        pageCount: number;
      };
    };
    data: IStrapiCategory[];
  }>('/categories', {
    params: {
      publicationState: 'preview',
      populate: '*',
      pagination: {
        pageSize: 10,
      },
    },
    paramsSerializer: (params) => {
      return QueryString.stringify(params);
    },
  });

  return {
    props: {
      categories: categories.data.data.map(convert_category_strapi),
      totalPages: categories.data.meta.pagination.pageCount,
    },
  };
});

export default Categories;

Categories.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
