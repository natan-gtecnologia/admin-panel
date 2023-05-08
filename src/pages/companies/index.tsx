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
import Head from 'next/head';
import { ICompany } from '../../@types/company';
import { getCompanies } from '../../components/Companies/getCompanies';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { api } from '../../services/apiClient';
import { withSSRAuth } from '../../utils/withSSRAuth';

/**
 * CompaniesProps is an object with three properties: companies, total, and totalPages. companies
 * is an array of ICompany objects, total is a number, and totalPages is a number.
 * @property {ICompany[]} companies - An array of ICompany objects.
 * @property {number} total - The total number of companies in the database.
 * @property {number} totalPages - The total number of pages.
 */
type CompaniesProps = {
  companies: ICompany[];
  totalPages: number;
};

/**
 * CellProps is an object with a row property that is an object with an original
 * property that is an ICompany.
 * @property row - The row object that contains the data for the current row.
 */
type CellProps = {
  row: {
    original: ICompany;
  };
};

const Companies: NextPageWithLayout<CompaniesProps> = ({
  companies: initialCompanies,
  totalPages: initialTotalPages,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sortedBy, setSortedBy] = useState('');
  const {
    data: { companies, totalPages },
    refetch: handleRefetchCompanies,
  } = useQuery(
    ['companies', currentPage, sortedBy, currentPageSize],
    async () => {
      const response = await getCompanies(undefined, {
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
                name: {
                  $containsi: search,
                },
              },
              {
                cnpj: {
                  $containsi: search,
                },
              },
              {
                email: {
                  $containsi: search,
                },
              },
            ],
          }),
        },
      });

      return {
        companies: response.companies,
        totalPages: response.totalPages,
      };
    },
    {
      initialData: {
        companies: initialCompanies,
        totalPages: initialTotalPages,
      },
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    },
  );

  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * It takes a search string, and then calls the getCompanies function from the API,
   * passing in the search string as a filter
   * @param {string} search - string - The search string
   */
  const handleSearch = useCallback(
    async (search: string) => {
      setSearch(search);
      setCurrentPage(1);

      await handleRefetchCompanies();
    },
    [handleRefetchCompanies],
  );

  /**
   * It gets the companies from the API, sets the companies, total, totalPages, and
   * currentPage state variables, and then calls the handleChangePage function
   * @param {number} page - The page number to fetch
   */
  const handleChangePage = useCallback(async (page: number) => {
    setCurrentPage(page);
  }, []);

  /**
   * It's a function that deletes a company from the database, and then refreshes the
   * page
   * @param {number} id - number - The id of the company to be deleted
   */
  const handleDeleteCompany = useCallback(
    async (id: number) => {
      try {
        await api.delete(`/companies/${id}`);

        await handleRefetchCompanies();
      } catch (error) {
        //toast.error('Erro ao excluir pedido');
      }
    },
    [handleRefetchCompanies],
  );

  /* It's a function that takes a sortBy string and an order string, and then
  sets the currentPage state variable to 1, sets the sortedBy state variable to
  the sortBy string and the order string, and then calls the handleRefetchCompanies
  function. */
  const handleSortBy = useCallback(
    async (sortBy: string, order: 'desc' | 'asc') => {
      setCurrentPage(1);
      setSortedBy(`${sortBy}:${order}`);
    },
    [],
  );

  const handleDeleteCompanies = useCallback(async () => {
    setIsDeleting(true);
    try {
      for (const id of deleteIds) {
        await api.delete(`/companies/${id}`);
      }

      await handleRefetchCompanies();
      setDeleteIds([]);
    } catch (error) {
      //toast.error('Erro ao excluir pedido');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteIds, handleRefetchCompanies]);

  const checkedAll = useCallback(() => {
    setDeleteIds((oldValues) => {
      if (oldValues.length === companies.length) {
        return [];
      } else {
        return companies.map((coupon) => coupon.id);
      }
    });
  }, [companies]);

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
              deleteIds.length === companies.length && deleteIds.length > 0
            }
          />
        ),
        Cell: (cellProps: CellProps) => {
          return (
            <input
              type="checkbox"
              className="customerCheckBox form-check-input"
              value={cellProps.row.original.id}
              checked={deleteIds.includes(cellProps.row.original.id)}
              onChange={(e) => {
                setDeleteIds((oldValues) => {
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
        Header: 'Nome da empresa',
        accessor: 'company',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          return <span className="d-block">{cellProps.row.original.name}</span>;
        },
      },
      {
        Header: 'CNPJ',
        accessor: 'cnpj',
        filterable: false,
        canSort: false,
        Cell: (cellProps: CellProps) => {
          return <span className="d-block">{cellProps.row.original.cnpj}</span>;
        },
      },
      {
        Header: 'E-mail',
        accessor: 'email',
        filterable: false,
        canSort: false,
        Cell: (cellProps: CellProps) => {
          return (
            <span className="d-block">{cellProps.row.original.email}</span>
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
                  href={`/companies/edit/${cellProps.row.original.id}`}
                  className="cursor-pointer"
                  aria-label="Editar company"
                >
                  <i className="ri-pencil-fill"></i>
                </Link>
              </div>
              <div className="delete">
                <ConfirmationModal
                  changeStatus={() =>
                    handleDeleteCompany(cellProps.row.original.id)
                  }
                  title="Excluir company"
                  message="Tem certeza que deseja excluir essa company? Essa ação não pode ser desfeita."
                >
                  <button
                    className="btn btn-link shadow-none p-0 text-danger fs-5 text-decoration-none cursor-pointer"
                    aria-label="Deletar company"
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
    [checkedAll, deleteIds, handleDeleteCompany, companies.length],
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

  /* It's a function that takes a search string, and then calls the getCompanies
  function from the API, passing in the search string as a filter */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce(handleSearch, 500), []);

  return (
    <div className="page-content">
      <Head>
        <title>Empresas - Dashboard</title>
      </Head>

      <BreadCrumb title="Empresas" pageTitle="Ecommerce" />

      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header className="card-header">
              <div className="d-flex align-items-center">
                <h5 className="card-title mb-0 flex-grow-1">Empresas</h5>
                <div className="flex-shrink-0">
                  <Link
                    href={'/companies/create'}
                    className="btn shadow-none btn-success"
                  >
                    <i className="ri-add-line align-bottom me-1"></i>
                    Adicionar nova empresa
                  </Link>{' '}
                  {deleteIds.length > 0 && (
                    <ConfirmationModal
                      changeStatus={handleDeleteCompanies}
                      title="Excluir companies"
                      message="Tem certeza que deseja excluir essas companies? Essa ação não pode ser desfeita."
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
                  data={companies}
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

      {isDeleting && <Loader loading={null} />}
    </div>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  try {
    const props = await getCompanies(ctx, {
      populate: '*',
      publicationState: 'preview',
      pagination: {
        pageSize: 10,
      },
    });

    return {
      props,
    };
  } catch (error) {
    return {
      props: {
        companies: [],
        totalPages: 0,
      },
    };
  }
});

export default Companies;

Companies.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
