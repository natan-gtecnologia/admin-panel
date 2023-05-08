/* eslint-disable @typescript-eslint/no-explicit-any */
import BreadCrumb from '@growth/growforce-admin-ui/components/Common/BreadCrumb';
import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import TableContainer from '@growth/growforce-admin-ui/components/Common/TableContainer';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { Button } from 'reactstrap';
import { NextPageWithLayout } from '../../@types/next';
import Layout from '../../containers/Layout';

import Loader from '@growth/growforce-admin-ui/components/Common/Loader';
import { Col, Row } from '@growth/growforce-admin-ui/index';
import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { NextPageContext } from 'next';
import Head from 'next/head';
import QueryString from 'qs';
import { ICustomers } from '../../@types/customers';
import { IStrapiCustomer } from '../../@types/strapi';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { setupAPIClient } from '../../services/api';
import { api } from '../../services/apiClient';
import { convert_customer_strapi } from '../../utils/convertions/convert_customer';
import { withSSRAuth } from '../../utils/withSSRAuth';

/**
 * TagsProps is an object with three properties: tags, total, and totalPages. tags
 * is an array of ITag objects, total is a number, and totalPages is a number.
 * @property {ICustomers[]} Customer - An array of ITag objects.
 * @property {number} total - The total number of tags in the database.
 * @property {number} totalPages - The total number of pages.
 */
type CustomersProps = {
  customers: ICustomers[];
  totalPages: number;
};

/**
 * CellProps is an object with a row property that is an object with an original
 * property that is an ITag.
 * @property row - The row object that contains the data for the current row.
 */
type CellProps = {
  row: {
    original: ICustomers;
  };
};

/**
 * It fetches a list of tags from the Strapi API, and converts them to a format
 * that's easier to work with in the frontend
 * @param params - Record<string, any> - The parameters to be passed to the API
 */
async function getCustomers(
  ctx: Pick<NextPageContext, 'req'>,
  params: Record<string, any>,
) {
  const apiClient = setupAPIClient(ctx);
  const customers = await apiClient.get<{
    meta: {
      pagination: {
        total: number;
        pageCount: number;
      };
    };
    data: IStrapiCustomer[];
  }>('/customers', {
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
    customers: customers.data.data.map(convert_customer_strapi),
    totalPages: customers.data.meta.pagination.pageCount,
  };
}

const Customers: NextPageWithLayout<CustomersProps> = ({
  customers: initialCustomers,
  totalPages: initialTotalPages,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sortedBy, setSortedBy] = useState('');
  const {
    data: { customers, totalPages },
    refetch: handleRefetchCustomers,
    isRefetching,
  } = useQuery(
    ['customers', currentPage, sortedBy, currentPageSize],
    async () => {
      const response = await getCustomers(undefined, {
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
                firstName: {
                  $containsi: search,
                },
              },
              {
                email: {
                  $containsi: search,
                },
              },
              {
                id: {
                  $containsi: search,
                },
              },
            ],
          }),
        },
      });

      return {
        customers: response.customers,
        totalPages: response.totalPages,
      };
    },
    {
      initialData: {
        customers: initialCustomers,
        totalPages: initialTotalPages,
      },
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    },
  );

  /**
   * It takes a search string, and then calls the getTags function from the API,
   * passing in the search string as a filter
   * @param {string} search - string - The search string
   */
  const handleSearch = useCallback(
    async (search: string) => {
      setSearch(search);
      setCurrentPage(1);

      await handleRefetchCustomers();
    },
    [handleRefetchCustomers],
  );

  /**
   * It gets the tags from the API, sets the tags, total, totalPages, and
   * currentPage state variables, and then calls the handleChangePage function
   * @param {number} page - The page number to fetch
   */
  const handleChangePage = useCallback(async (page: number) => {
    setCurrentPage(page);
  }, []);

  /**
   * It's a function that deletes a tag from the database, and then refreshes the
   * page
   * @param {number} id - number - The id of the tag to be deleted
   */
  const handleDeleteCustomer = useCallback(
    async (id: number) => {
      try {
        await api.delete(`/customers/${id}`);

        await handleRefetchCustomers();
      } catch (error) {
        //toast.error('Erro ao excluir pedido');
      }
    },
    [handleRefetchCustomers],
  );

  const handleSortBy = useCallback(
    async (sortBy: string, order: 'desc' | 'asc') => {
      setCurrentPage(1);
      setSortedBy(`${sortBy}:${order}`);
    },
    [],
  );

  const columns = useMemo(
    () => [
      {
        Header: 'ID',
        accessor: 'id',
        filterable: false,
        Cell: (cellProps: CellProps) => (
          <span>{cellProps.row.original.id}</span>
        ),
      },
      {
        Header: 'Nome do Cliente',
        accessor: 'firstName',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          return (
            <span className="d-block">
              {cellProps.row.original.firstName}{' '}
              {cellProps.row.original.lastName}
            </span>
          );
        },
      },
      {
        Header: 'Email',
        accessor: 'email',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          return (
            <span className="d-block">{cellProps.row.original.email}</span>
          );
        },
      },
      {
        Header: 'Endereço',
        accessor: 'address',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          return (
            <span className="d-block">
              {cellProps.row.original.address.city} -{' '}
              {cellProps.row.original.address.state}
            </span>
          );
        },
      },
      {
        Header: 'Data de cadastro',
        accessor: 'createdAt',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          return (
            <span className="d-block">
              {new Date(cellProps.row.original.createdAt).toLocaleDateString()}
            </span>
          );
        },
      },
      {
        Header: 'Ultima visita',
        accessor: 'updatedAt',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          return (
            <span className="d-block">
              {new Date(cellProps.row.original.updatedAt).toLocaleDateString()}
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
                  href={`/customers/edit/${cellProps.row.original.id}`}
                  className="cursor-pointer"
                  aria-label="Editar cliente"
                >
                  <i className="ri-pencil-fill"></i>
                </Link>
              </div>
              <div className="delete">
                <ConfirmationModal
                  changeStatus={() =>
                    handleDeleteCustomer(cellProps.row.original.id)
                  }
                  title="Excluir cliente"
                  message="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
                >
                  <button
                    className="btn btn-link shadow-none p-0 text-danger fs-5 text-decoration-none cursor-pointer"
                    aria-label="Deletar cliente"
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
    [handleDeleteCustomer],
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce(handleSearch, 500), []);

  return (
    <div className="page-content">
      <Head>
        <title>Clientes - GrowForce</title>
      </Head>

      <BreadCrumb title="Clientes" pageTitle="Ecommerce" />

      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header className="card-header">
              <div className="d-flex align-items-center">
                <h5 className="card-title mb-0 flex-grow-1">
                  Listagem de Clientes
                </h5>
                <div className="flex-shrink-0">
                  {/*<button type="button" className="btn shadow-none btn-info">
                    <i className="ri-file-upload-line align-bottom me-1"></i>{' '}
                    Exportar
                  </button>{' '}
                  <button type="button" className="btn shadow-none btn-info">
                    <i className="ri-file-download-line align-bottom me-1"></i>{' '}
                    Importar
                  </button>{' '}*/}
                  <Link
                    href={'/customers/create'}
                    className="btn shadow-none btn-success"
                  >
                    <i className="ri-add-line align-bottom me-1"></i>
                    Adicionar cliente
                  </Link>{' '}
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
                  data={customers}
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

      {isRefetching && <Loader loading={null} />}
    </div>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const props = await getCustomers(ctx, {
    populate: '*',
    publicationState: 'preview',
    pagination: {
      pageSize: 10,
    },
  });

  return {
    props,
  };
});

export default Customers;

Customers.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
